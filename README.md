# 🚀 React Todo App — Containerized DevOps Project #

> React · Docker · NGINX · Kubernetes · Helm · GitHub Actions · ArgoCD

---

## 📁 Project Structure

```
react-todo-devops/
├── src/                        # React source code
│   ├── App.jsx                 # Main Todo component
│   ├── App.css                 # Styles
│   └── main.jsx                # Entry point
├── index.html                  # Vite HTML template
├── package.json
├── vite.config.js
│
├── Dockerfile                  # Multi-stage build (Node → NGINX)
├── nginx.conf                  # NGINX config for SPA + health check
├── .dockerignore
│
├── k8s/                        # Raw Kubernetes manifests
│   ├── deployment.yaml         # 2 replicas, rolling updates, probes
│   ├── service.yaml            # ClusterIP service
│   ├── ingress.yaml            # NGINX Ingress
│   └── argocd-app.yaml         # ArgoCD GitOps config
│
├── helm/todo-app/              # Helm chart (templated K8s)
│   ├── Chart.yaml
│   ├── values.yaml             # Default values (image, replicas, etc.)
│   └── templates/
│       ├── deployment.yaml
│       └── service.yaml
│
└── .github/workflows/
    └── ci-cd.yml               # GitHub Actions pipeline
```

---

## 🏃 Run Locally

```bash
# 1. Install and run dev server
npm install
npm run dev                     # http://localhost:5173

# 2. Build for production
npm run build
```

---

## 🐳 Docker

```bash
# Build image
docker build -t react-todo-devops:latest .

# Run container
docker run -p 8080:80 react-todo-devops:latest

# Visit http://localhost:8080
```

**Why multi-stage?** The builder stage uses a full Node image to compile React.
The final image uses only NGINX (~25MB) — no Node, no source code, minimal attack surface.

---

## ☸️ Kubernetes

```bash
# Apply all manifests
kubectl apply -f k8s/

# Check status
kubectl get pods
kubectl get svc
kubectl get ingress

# View logs
kubectl logs -l app=todo-app
```

---

## ⛵ Helm

```bash
# Install (first time)
helm install todo-release ./helm/todo-app

# Upgrade (after changes)
helm upgrade todo-release ./helm/todo-app

# Override values per environment
helm upgrade todo-release ./helm/todo-app \
  --set replicaCount=3 \
  --set image.tag=sha-abc1234
```

**Why Helm over raw YAML?** Helm lets you template values like image tag, replica count,
and domain — so the same chart deploys to dev/staging/prod with different values.

---

## 🔄 CI/CD — GitHub Actions

The pipeline has 3 jobs that run in sequence:

```
Push to main
    │
    ▼
[1] Build & Test        → npm install + npm run build
    │
    ▼
[2] Docker Build/Push   → Builds image, pushes to GHCR with SHA tag
    │
    ▼
[3] Update Helm values  → Bumps image tag in values.yaml, commits back to Git
```

ArgoCD detects the Git change and syncs automatically. ✅

---

## 🔁 ArgoCD (GitOps)

```bash
# Install ArgoCD (one-time)
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Apply the app config
kubectl apply -f k8s/argocd-app.yaml

# Get admin password
kubectl get secret -n argocd argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d
```

**GitOps model:** Git is the single source of truth. ArgoCD continuously watches the repo
and ensures the cluster state matches what's in Git — automatically healing drift.

---

## 🎤 Interview Q&A Cheat Sheet

### "Walk me through what this project does"
> "I built a React Todo app and set up the full DevOps pipeline around it. The app is containerized using Docker with a multi-stage build — Node.js compiles the React code, and the final image is just NGINX serving the static files, which keeps it small and secure. I wrote Kubernetes manifests for the Deployment, Service, and Ingress, and packaged them into a Helm chart so I can deploy the same chart to multiple environments with different values. The CI/CD runs on GitHub Actions — it builds and tests the app, builds the Docker image, pushes it to GitHub Container Registry, and then updates the image tag in the Helm chart. ArgoCD picks up that Git change and syncs it to the cluster automatically. That's the GitOps pattern."

### "Why Docker + NGINX instead of just Node?"
> "The multi-stage build means the production image doesn't have Node.js or the source code — just NGINX and the compiled static files. This makes the image about 10x smaller and reduces the attack surface significantly."

### "What's the difference between Helm and raw Kubernetes YAML?"
> "Raw YAML is static — if I want to deploy to staging vs prod with different replica counts or image tags, I'd have to maintain separate files. Helm templates those values, so I have one chart and I override values per environment using values files or --set flags."

### "What is GitOps and why did you use ArgoCD?"
> "GitOps means Git is the single source of truth for cluster state. Instead of running kubectl apply manually, ArgoCD watches the Git repo and automatically syncs any changes to the cluster. It also self-heals — if someone manually changes something in the cluster, ArgoCD reverts it back to match Git. This gives you full auditability and rollback for free."

### "What are liveness and readiness probes?"
> "Liveness probes tell Kubernetes if the container is alive — if it fails, Kubernetes restarts the pod. Readiness probes tell Kubernetes if the pod is ready to receive traffic — if it fails, the pod is removed from the Service endpoints but not restarted. I have a /health endpoint in NGINX that returns 200 OK for both."

### "How do you do zero-downtime deployments?"
> "RollingUpdate strategy in the Deployment. I set maxUnavailable: 0 so Kubernetes always brings up a new pod before taking down the old one. Combined with readiness probes, traffic only shifts to the new pod once it's actually ready."

### "How does the CI/CD pipeline trigger a deployment?"
> "The GitHub Actions pipeline updates the image tag in values.yaml and commits it back to the repo. ArgoCD is watching that repo and detects the change within a few seconds, then syncs the new image tag to the cluster. So there's no kubectl in the pipeline — Git is the trigger."
