---
title: "Run Kubernetes Clusters for Less with Amazon EC2 Spot and Karpenter"
seoDescription: "Run Kubernetes Clusters for Less with Amazon EC2 Spot and Karpenter"
datePublished: Tue Jul 29 2025 12:31:31 GMT+0000 (Coordinated Universal Time)
cuid: cmdoincjq000102lb5azu1o31
slug: run-kubernetes-clusters-for-less-with-amazon-ec2-spot-and-karpenter
cover: https://cdn.hashnode.com/res/hashnode/image/upload/v1753790916349/dd4ebc55-c256-4029-b456-a5df3a67fa41.png
tags: ec2, aws, kubernetes, karpenter

---

Running Kubernetes workloads on Amazon EKS (Elastic Kubernetes Service) is powerful but can become costly, especially for high-scale environments. Fortunately, AWS offers **EC2 Spot Instances** to cut compute costs by up to **90%**, and **Karpenter**, an open-source autoscaler, to optimize instance provisioning in real-time.

In this guide, I will walk you through:

* What Spot Instances and Karpenter are
    
* Why they are cost-effective together
    
* A step-by-step guide to deploy Karpenter with EKS
    
* Best practices
    

## What Are EC2 Spot Instances?

**Spot Instances** let you use AWS’s unused EC2 capacity at reduced prices. However, they can be **interrupted** with just a 2-minute warning if AWS reclaims capacity.

**Pros**:

* Up to **90% cheaper** than On-Demand
    
* Access to high-performance instances
    

**Cons**:

* Not suitable for stateful, long-running jobs unless fault-tolerant
    
* Can be **terminated any time**
    

---

## 🚀 What is Karpenter?

**Karpenter** is an open-source autoscaler for Kubernetes, purpose-built for AWS. Unlike the default Cluster Autoscaler:

* It **launches instances dynamically** based on pod needs.
    
* It selects the **best instance types and capacity pools**.
    
* Supports **Spot, On-Demand, and Graviton** instances.
    
* Supports **zones, architectures, taints, labels, affinities**, etc.
    

---

## 📊 Why Use EC2 Spot + Karpenter?

Combining both gives you:

* Cost-efficient workloads (Spot)
    
* Smart and dynamic scaling (Karpenter)
    
* Minimized waste through pod-to-instance right-sizing
    

---

## 🛠️ Prerequisites

| Requirement | Value |
| --- | --- |
| Kubernetes Cluster | Amazon EKS |
| IAM Permissions | `eks:DescribeCluster`, `iam:PassRole`, etc. |
| kubectl & eksctl | Installed |
| AWS CLI | Installed |
| Helm | Installed |
| Region | e.g., `us-east-1` |

---

## 🧰 Step-by-Step Guide

---

### **Step 1: Create an EKS Cluster**

```yaml
eksctl create cluster \
  --name karpenter-demo \
  --region us-east-1 \
  --version 1.29 \
  --nodegroup-name default-ng \
  --nodes 2 \
  --nodes-min 1 \
  --nodes-max 5 \
  --node-type t3.medium \
  --managed
```

---

### **Step 2: Install Karpenter Controller**

#### 2.1 Add Helm Repo

```bash
helm repo add karpenter https://charts.karpenter.sh
helm repo update
```

---

### **Step 3: Create Karpenter IAM Role & Instance Profile**

#### 3.1 Download AWS CloudFormation Template

```bash
curl -fsSL https://karpenter.sh/docs/getting-started/cloudformation.yaml -o karpenter-iam.yaml
aws cloudformation deploy \
  --stack-name "KarpenterIRSA" \
  --template-file karpenter-iam.yaml \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    ClusterName=karpenter-demo \
    ServiceAccountNamespace=karpenter \
    ServiceAccountName=karpenter \
    ClusterEndpoint=$(aws eks describe-cluster --name karpenter-demo --region us-east-1 --query "cluster.endpoint" --output text) \
    OIDCProvider=$(aws eks describe-cluster --name karpenter-demo --region us-east-1 --query "cluster.identity.oidc.issuer" --output text | sed -e "s/^https:\/\///")
```

---

### **Step 4: Install Karpenter via Helm**

```apache
helm upgrade --install karpenter karpenter/karpenter \
  --namespace karpenter --create-namespace \
  --set serviceAccount.create=false \
  --set serviceAccount.name=karpenter \
  --set settings.clusterName=karpenter-demo \
  --set settings.clusterEndpoint=$(aws eks describe-cluster --name karpenter-demo --region us-east-1 --query "cluster.endpoint" --output text) \
  --set settings.aws.defaultInstanceProfile=KarpenterNodeInstanceProfile-karpenter-demo
```

---

### **Step 5: Create a Provisioner**

```apache
# karpenter-provisioner.yaml
apiVersion: karpenter.sh/v1alpha5
kind: Provisioner
metadata:
  name: default
spec:
  requirements:
    - key: "karpenter.sh/capacity-type"
      operator: In
      values: ["spot"]   # Only use spot instances
    - key: "node.kubernetes.io/instance-type"
      operator: In
      values: ["m5.large", "m5.xlarge", "t3.medium"]
  limits:
    resources:
      cpu: 1000
  provider:
    subnetSelector:
      kubernetes.io/cluster/karpenter-demo: owned
    securityGroupSelector:
      kubernetes.io/cluster/karpenter-demo: owned
  ttlSecondsAfterEmpty: 30
```

Apply it:

```apache
kubectl apply -f karpenter-provisioner.yaml
```

---

### **Step 6: Deploy Sample Workload**

```apache
# sample-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: inflate
spec:
  replicas: 5
  selector:
    matchLabels:
      app: inflate
  template:
    metadata:
      labels:
        app: inflate
    spec:
      containers:
        - name: inflate
          image: public.ecr.aws/eks-distro/kubernetes/pause:3.5
          resources:
            requests:
              cpu: "1"
```

Deploy it:

```apache
kubectl apply -f sample-deployment.yaml
```

Karpenter will observe that the default nodes don’t have capacity and will **launch Spot Instances** that fit.

---

## 📉 Cost Comparison Illustration

| Instance Type | On-Demand Price | Spot Price | Savings |
| --- | --- | --- | --- |
| `m5.large` | $0.096/hr | ~$0.028/hr | ~70% |
| `t3.medium` | $0.0416/hr | ~$0.012/hr | ~71% |

Provisioning 100 pods needing `1 vCPU` each on Spot vs On-Demand could reduce your bill from **$230/month to ~$70/month**.

---

## 📊 Monitoring Karpenter

You can view logs and activity:

```apache
kubectl logs -n karpenter -l app.kubernetes.io/name=karpenter
```

To check provisioned nodes:

```apache
kubectl get nodes -l karpenter.sh/provisioner-name=default
```

---

## 🛡️ Spot Best Practices with Karpenter

1. **Diversify instance types** in the `Provisioner`.
    
2. Set `taints` and `affinity` for critical workloads to run on On-Demand.
    
3. Use **Node Termination Handler (NTH)** to drain pods gracefully.
    
4. Enable **Pod Disruption Budgets (PDBs)** to protect critical workloads.
    
5. Track **Spot Interruption metrics** with Prometheus.
    

---

## 📌 Final Thoughts

Using **Karpenter with EC2 Spot Instances** offers a powerful way to **cut infrastructure costs** while still delivering **resilient, scalable Kubernetes workloads**.

| Benefit | Description |
| --- | --- |
| ⚡ Fast Scaling | Karpenter reacts in seconds |
| 💸 Cost Savings | Spot = up to 90% cheaper |
| 🔄 Flexibility | Mix and match instance types, zones, families |
| ☁️ Cloud-Native | Built for AWS and Kubernetes |