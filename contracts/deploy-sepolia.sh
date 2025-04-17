#!/bin/bash

# 确保脚本中的错误会导致脚本终止
set -e

# 检查 .env 文件是否存在
if [ ! -f .env ]; then
  echo "Creating .env file from .env.example..."
  cp .env.example .env
fi

# 加载环境变量
source .env

# 运行部署脚本
echo "Deploying contracts..."
forge script script/Deploy-sepolia.s.sol:DeployScript --rpc-url $BASE_SEPOLIA_RPC_URL --broadcast -vvv
echo "Contracts deployed successfully."

