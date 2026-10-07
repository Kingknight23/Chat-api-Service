# AWS + GitHub Actions deployment

This deployment intentionally uses **HTTP + WebSocket (`ws://`)**, not HTTPS/WSS.

## Architecture

GitHub -> GitHub Actions (OIDC) -> S3 deployment bundle -> AWS Systems Manager -> EC2 -> Nginx -> React + Node API/WebSocket -> MongoDB Atlas

## 1. AWS resources

Create:
- One Ubuntu 22.04/24.04 EC2 instance.
- One private S3 bucket for deployment artifacts.
- An EC2 IAM role with `AmazonSSMManagedInstanceCore` and a narrow `s3:GetObject` permission for the deployment bucket.
- A GitHub Actions IAM role trusted by `token.actions.githubusercontent.com`.

The GitHub role needs only:
- `s3:PutObject` on `arn:aws:s3:::<DEPLOY_BUCKET>/releases/*`
- `ssm:SendCommand`
- `ssm:GetCommandInvocation`

Replace placeholders in `github-actions-role-trust-policy.json` and `github-actions-role-policy.json` with your AWS account, GitHub owner/repository, and bucket.

## 2. EC2 network security group

Allow inbound:
- TCP 80 from `0.0.0.0/0` for the HTTP application.
- TCP 22 only from your own IP if you need SSH.

Do not expose port 5000 publicly. Nginx proxies `/api`, `/ws`, and `/health` to `127.0.0.1:5000`.

## 3. Bootstrap EC2

Attach the SSM role to the instance, then run `aws/ec2-bootstrap.sh` as root on the EC2 instance. The instance needs outbound internet access for Ubuntu packages and npm.

Edit `/etc/chat-api.env` with real values. Never commit this file.

Generate strong secrets, for example:

`openssl rand -base64 48`

Set:
- `MONGO_URI`
- `JWT_SECRET`
- `KEY_ENCRYPTION_SECRET`
- `ADMIN_PASSWORD`
- `CORS_ORIGIN=http://YOUR_PUBLIC_IP_OR_DOMAIN`
- `VITE_API_URL=http://YOUR_PUBLIC_IP_OR_DOMAIN`
- `VITE_WS_URL=ws://YOUR_PUBLIC_IP_OR_DOMAIN`
- `HTTPS=false`

## 4. GitHub repository variables

Add repository variables:
- `AWS_REGION` = your AWS region, e.g. `ca-central-1`
- `DEPLOY_BUCKET` = your private deployment bucket name
- `EC2_INSTANCE_ID` = your EC2 instance ID

Add repository secret:
- `AWS_DEPLOY_ROLE_ARN` = ARN of the GitHub OIDC deployment role

Do not add AWS access keys to GitHub.

## 5. GitHub Actions

Every push to `main` runs CI and then deploys. CI runs backend tests, `npm audit --omit=dev --audit-level=high`, and the frontend build.

The deploy workflow creates an artifact without `.env`, `node_modules`, or `dist`, uploads it to S3, and tells the EC2 instance to retrieve it using Systems Manager.

## 6. HTTP warning

This project is intentionally configured for HTTP/WS. HTTP does not encrypt credentials, JWTs, WebSocket traffic, or other API metadata in transit. The application's E2EE protects message contents after encryption, but it does not make HTTP transport secure.

Use HTTPS/WSS before handling real users or sensitive data.
