# NestJS Clean Architecture - Azure Deployment Guide

This guide covers deploying the NestJS application to Azure using Terraform Infrastructure-as-Code, Docker Hub for container images, and GitHub Actions CI/CD pipeline.

## Quick Start (30 minutes)

```bash
# 1. Prepare Terraform configuration
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars: set azure_region and github_repo_url

# 2. Create Azure Infrastructure
terraform init
terraform plan
terraform apply
# Note the VM IP address from outputs!

# 3. Configure Remote Backend (Optional but recommended)
# Edit backend.tf with storage account values from step 2 output
terraform init -reconfigure

# 4. Add GitHub Secrets (7 values)
# Go to GitHub repo: Settings → Secrets and variables → Actions
# Add: DOCKER_HUB_USERNAME, DOCKER_HUB_PASSWORD, SSH_HOST, SSH_USER, SSH_PRIVATE_KEY, DB_PASSWORD, CORS_ORIGIN

# 5. Deploy!
git add .
git commit -m "Deploy to Azure"
git push origin main
# Watch GitHub Actions automatically deploy
```

---

## Architecture Overview

The deployment architecture consists of:

- **Docker Hub**: Stores Docker images built by GitHub Actions
- **Azure Virtual Machine (Ubuntu 20.04)**: Runs the application and PostgreSQL via Docker Compose
- **Azure Virtual Network & Security Group**: Network isolation with SSH and port 3000 access only
- **Azure Storage Account**: Stores Terraform state file for infrastructure management (optional)
- **GitHub Actions**: Automated CI/CD pipeline that builds and deploys on push/merge to main branch

```
┌─────────────────────────────────────────────────────────────┐
│                     GitHub Repository                       │
│              (Push/Merge to main branch)                    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│               GitHub Actions CI/CD Pipeline                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 1. Build Docker image                                 │ │
│  │ 2. Push to Docker Hub                                 │ │
│  │ 3. SSH into VM                                        │ │
│  │ 4. Pull latest image from Docker Hub                  │ │
│  │ 5. Run docker-compose up -d                           │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                   Azure Cloud Environment                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Resource Group: challenge-obel-prod-rg                │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │ Virtual Machine (Ubuntu 20.04)                   │ │ │
│  │  │  ├─ Port 22 (SSH)                                │ │ │
│  │  │  ├─ Port 3000 (NestJS API)                       │ │ │
│  │  │  └─ Docker Compose                               │ │ │
│  │  │      ├─ NestJS Container (from Docker Hub)       │ │ │
│  │  │      └─ PostgreSQL Container (with volume)       │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │ Storage Account (Terraform Backend - Optional)   │ │ │
│  │  │ Stores: prod.terraform.tfstate                   │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Docker Hub (External - Free)                               │
│  └─ Stores your Docker images (nestjs-app:latest, etc.)    │
└──────────────────────────────────────────────────────────────┘
```

## Prerequisites

Before you begin, ensure you have:

1. **Azure Account** with active subscription and CLI installed
   ```bash
   az login
   az account show
   ```

2. **Terraform** installed (v1.0+)
   ```bash
   terraform version
   ```

3. **GitHub Account** with the repository set up (either public or private)

4. **SSH Key Pair** for Azure VM access
   ```bash
   ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa
   ```

5. **Git** installed locally to manage code

## Step 1: Initial Terraform Setup

### 1.1 Create Terraform Configuration

Copy the example variables file:

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` with your values:

```hcl
project_name      = "nestjs-app"          # Project identifier
environment        = "prod"               # Environment name
azure_region       = "eastus"             # Azure region (eastus, westus, etc.)
vm_size            = "Standard_B2s"       # VM size (2 vCPU, 4GB RAM, ~$30-40/month)
admin_username     = "azureuser"          # VM admin user
acr_name           = "nestjsappprod"      # ACR name (must be globally unique, alphanumeric only)
github_repo_url    = "https://github.com/YOUR_USERNAME/challenge-obel.git"
```

**Important**: ACR names must be globally unique and contain only alphanumeric characters. Use a unique prefix like your company name or username.

### 1.2 Initialize Terraform (Local Backend First)

From the `terraform/` directory:

```bash
terraform init
```

This initializes Terraform and creates `.terraform/` directory locally.

### 1.3 Validate Configuration

```bash
terraform validate
```

### 1.4 Plan Deployment

Review all resources that will be created:

```bash
terraform plan -out=tfplan
```

This outputs a plan showing:
- Resource Group
- Virtual Network & Subnet
- Network Security Group (SSH + port 3000 inbound)
- Public IP address
- VM instance
- Storage Account for state backend (optional)

### 1.5 Apply Initial Configuration

```bash
terraform apply tfplan
```

This creates all Azure resources. **Note the outputs**, especially:
- `vm_public_ip`: IP address for SSH access
- `vm_private_ip`: Private IP address for internal reference
- `storage_account_name`: For backend configuration (optional)
- `storage_container_name`: Should be `tfstate`

### 1.6 Configure Remote Backend (Terraform State)

Now configure Terraform to use Azure Storage for state backend to avoid state conflicts in team environments.

Create `backend.tf`:

```hcl
terraform {
  backend "azurerm" {
    resource_group_name  = "nestjs-app-prod-rg"
    storage_account_name = "outputted_storage_account_name"
    container_name       = "tfstate"
    key                  = "prod.terraform.tfstate"
  }
}
```

Replace values with actual outputs from step 1.5.

Reconfigure Terraform backend:

```bash
terraform init -reconfigure
```

When prompted, confirm migration of state to Azure Storage.

Verify state is now remote:

```bash
terraform state list
```

## Step 2: Configure GitHub Secrets

GitHub Actions needs credentials to:
1. Push images to Docker Hub
2. SSH into the VM
3. Configure environment variables

### 2.1 Get Docker Hub Credentials

You need a Docker Hub account with credentials:

**Option A: Use Docker Hub Account Password** (Not Recommended)
- Username: Your Docker Hub username
- Password: Your Docker Hub password

**Option B: Use Docker Hub Access Token** (Recommended)
1. Go to Docker Hub: https://hub.docker.com/settings/security
2. Click "New Access Token"
3. Name it: `github-actions`
4. Set permissions: "Read & Write"
5. Generate and copy the token

### 2.2 Get SSH Private Key Content

```bash
cat ~/.ssh/id_rsa | pbcopy  # macOS
# or
cat ~/.ssh/id_rsa  # Linux/Windows - then copy manually
```

### 2.3 Get VM Details

From Terraform outputs:
- `SSH_HOST`: Public IP of the VM (from `vm_public_ip` output)
- `SSH_USER`: Username (default: `azureuser`)

### 2.4 Add GitHub Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add these secrets:

| Secret Name | Value | Source / Format |
|---|---|---|
| `DOCKER_HUB_USERNAME` | `your-docker-username` | Your Docker Hub username |
| `DOCKER_HUB_PASSWORD` | `dckr_pat_xxxxx` or password | Docker Hub access token OR password (token recommended) |
| `SSH_HOST` | `1.2.3.4` | Terraform output `vm_public_ip` |
| `SSH_USER` | `azureuser` | From `terraform.tfvars` |
| `SSH_PRIVATE_KEY` | Full content of `~/.ssh/id_rsa` | Paste entire private key file |
| `DB_PASSWORD` | `YourSecurePassword123!` | Generate and store securely (used for PostgreSQL) |
| `CORS_ORIGIN` | `http://1.2.3.4:3000` | Or your domain if available |

**Security Notes**:
- Never commit these secrets to Git
- All secrets are encrypted at rest by GitHub
- Use Docker Hub access token instead of password (more secure & can be revoked independently)
- Rotate credentials periodically
- Use strong passwords for `DB_PASSWORD`

## Step 3: Deploy via GitHub Actions

### 3.1 Trigger Deployment

Push code to `main` branch (or any commit on main):

```bash
git add .
git commit -m "Deploy to Azure"
git push origin main
```

### 3.2 Monitor Deployment

1. Go to **Actions** tab in GitHub repository
2. Watch the workflow run in real-time
3. Pipeline stages:
   - **Build and Push**: Builds Dockerfile and pushes to ACR (~2-3 minutes)
   - **Deploy**: SSH into VM, pulls Docker Hub image, and runs `docker-compose -f docker-compose.vm.yml up` (~1-2 minutes)

Workflow will automatically fail and report if any step fails.

### 3.3 Verify Deployment

Check application is running:

```bash
curl http://YOUR_VM_IP:3000/api
```

You should get a response (might be 404 but that's expected if no matching route).

Check container status:

```bash
ssh azureuser@YOUR_VM_IP
docker-compose -f docker-compose.vm.yml ps
docker-compose -f docker-compose.vm.yml logs -f nestjs
```

## Step 4: Manual Deployment (If Needed)

If you want to deploy without pushing code or GitHub is unavailable:

### Rebuild and Deploy via Docker Hub

```bash
# From your local machine
# 1. Build image locally
docker build -t your-docker-username/nestjs-app:latest .

# 2. Login to Docker Hub
docker login

# 3. Push image
docker push your-docker-username/nestjs-app:latest

# 4. SSH and pull
ssh azureuser@YOUR_VM_IP
cd /home/azureuser/app
docker-compose -f docker-compose.vm.yml pull
docker-compose -f docker-compose.vm.yml down
docker-compose -f docker-compose.vm.yml up -d
```

## Updating Environment Variables

To update environment variables (database password, CORS origin, etc.):

### Option 1: Via GitHub Secrets (Recommended)

1. Update secret in GitHub Settings
2. Trigger a new deployment by pushing code to main

### Option 2: Manual SSH Update

```bash
ssh azureuser@YOUR_VM_IP
cd /home/azureuser/app

# Edit .env file
nano .env

# Restart containers
docker-compose restart
```

## Troubleshooting

### Problem: Virtual Network fails with 404 error

**Error message:**
```
Error: waiting for provisioning state of Virtual Network... unexpected status 404 (404 Not Found)
```

**Cause:** Race condition - Azure is slow to acknowledge the resource creation, or temporary API issues.

**Solution:**
```bash
cd terraform

# 1. Destroy partial resources
terraform destroy -auto-approve

# 2. Wait 30 seconds
sleep 30

# 3. Retry the apply
terraform plan -out=tfplan
terraform apply tfplan
```

If it still fails, try a different Azure region like `westus` or `eastus2`.

### Problem: Workflow fails at "Deploy to VM"

**Check SSH connectivity:**
```bash
ssh -v azureuser@YOUR_VM_IP
```

**Verify private key:**
```bash
# Key should be valid RSA format
ssh-keygen -y -f ~/.ssh/id_rsa
```

### Problem: Docker image fails to push to Docker Hub

**Verify login:**
```bash
docker login
```

**Check Docker Hub:**
Go to Docker Hub and verify your username/token are correct.
If using access token, ensure it has "Read & Write" permissions.

**Re-authenticate in GitHub Secrets:**
If token is wrong, update both:
- `DOCKER_HUB_USERNAME`
- `DOCKER_HUB_PASSWORD`

### Problem: Application crashes after deployment

**SSH into VM and check logs:**
```bash
ssh azureuser@YOUR_VM_IP
docker-compose logs nestjs
docker-compose logs postgres
```

**Common issues:**
- Database password mismatch: Check `.env` file: `cat /home/azureuser/app/.env`
- Port 3000 already in use: `docker ps` and `docker-compose down`
- Insufficient disk space: `df -h` to check VM disk usage

### Problem: PostgreSQL won't start

```bash
ssh azureuser@YOUR_VM_IP

# Check volume exists
docker volume ls | grep postgres_data

# Check database files
docker volume inspect postgres_data

# Check logs
docker-compose logs postgres

# If corrupted, remove and recreate (WARNING: DATA LOSS)
docker volume rm postgres_data
docker-compose down
docker-compose up -d
```

### Problem: Application running but giving 503 errors

Usually means PostgreSQL hasn't fully initialized. Wait 30-60 seconds and try again:

```bash
curl http://YOUR_VM_IP:3000/api/users
```

Database migrations run automatically on container startup.

## Monitoring & Maintenance

### View Application Logs

```bash
ssh azureuser@YOUR_VM_IP
docker-compose logs -f nestjs
```

### Check Disk Usage

PostgreSQL volumes can grow over time:

```bash
ssh azureuser@YOUR_VM_IP
du -sh /var/lib/docker/volumes/*/_ | sort -h
```

### Restart Services

```bash
ssh azureuser@YOUR_VM_IP
cd /home/azureuser/app

# Graceful restart
docker-compose restart

# Full restart (will lose in-flight requests)
docker-compose down
docker-compose up -d
```

### Backup Database

For proof-of-concept, simple export:

```bash
ssh azureuser@YOUR_VM_IP
docker exec nestjs_postgres pg_dump -U postgres nestjs_clean_arch > backup.sql
```

## Cost Estimation

Monthly breakdown (as of April 2026):

| Resource | Cost |
|---|---|
| VM (Standard_B2s, Linux) | ~$35 |
| Public IP | ~$2 |
| Storage Account (optional, for state) | ~$0.12 |
| Docker Hub (free tier) | Free* |
| Data transfer out | Variable (~$0.087/GB) |
| **TOTAL (without storage)** | **~$37-40/month** |

*Docker Hub charges per active token and image pulls beyond free tier (100 pulls/6hrs). For production, consider Docker Hub Pro ($5/month) for unlimited pulls.

**Cost Savings vs ACR:**
- No ACR Basic tier (~$5/month)
- Total savings: ~$5/month
- Annual savings: ~$60

## Cleanup

To delete all resources and stop incurring charges:

```bash
cd terraform

# Review resources to be destroyed
terraform plan -destroy

# Destroy all Azure resources
terraform destroy

# This WILL delete:
# - VM and all Docker containers
# - ACR and all stored images
# - Virtual Network
# - Storage Account with Terraform state
# - All associated resources
```

After running `terraform destroy`, you can safely commit the `terraform/` directory without sensitive data.

## Next Steps

- **Load Balancing**: Use Azure Application Gateway for multiple VMs
- **Database Upgrade**: Migrate to Azure Database for PostgreSQL for HA and backups
- **SSL/TLS**: Add reverse proxy (nginx) or Application Gateway for HTTPS
- **Monitoring**: Enable Azure Monitor and configure alerts
- **Backup Strategy**: Set up automated VM snapshots and database backups
- **Scaling**: Use Azure VM Scale Sets for auto-scaling based on metrics

## Support & Documentation

- [Terraform Azure Provider Docs](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Azure CLI Command Reference](https://learn.microsoft.com/en-us/cli/azure/reference-index)
- [Docker Compose Documentation](https://docs.docker.com/compose/)


