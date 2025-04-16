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

# 检查 Anvil 是否正在运行
if ! curl -s -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' $ANVIL_RPC_URL > /dev/null; then
  echo "Anvil is not running. Starting Anvil..."
  anvil &
  ANVIL_PID=$!
  # 给 Anvil 一些时间启动
  sleep 2
  echo "Anvil started with PID: $ANVIL_PID"
else
  echo "Anvil is already running."
fi

# 运行部署脚本
echo "Deploying contracts..."
forge script script/Deploy-anvil.s.sol:DeployScript --rpc-url $ANVIL_RPC_URL --broadcast -vvv

# 如果我们启动了 Anvil，则在脚本执行完毕后提示用户
if [ -n "$ANVIL_PID" ]; then
  echo "Contracts deployed successfully. Anvil is still running (PID: $ANVIL_PID)."
  echo "Press Ctrl+C to stop Anvil or run 'kill $ANVIL_PID' to stop it manually."
  # 等待用户中断
  wait $ANVIL_PID
else
  echo "Contracts deployed successfully."
fi
