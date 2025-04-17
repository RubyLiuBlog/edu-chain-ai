"use client";

import type React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import {
  RainbowKitProvider,
  darkTheme,
  RainbowKitAuthenticationProvider,
  createAuthenticationAdapter,
  AuthenticationStatus,
} from "@rainbow-me/rainbowkit";
import { createSiweMessage } from "viem/siwe";

import { config } from "@/utils/wagmi";
import { useEffect, useState } from "react";
import { CommonResponse } from "@/types/request";

const queryClient = new QueryClient();

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001";

export function Providers({ children }: { children: React.ReactNode }) {
  const [authStatus, setAuthStatus] =
    useState<AuthenticationStatus>("unauthenticated");

  useEffect(() => {
    const storedStatus = window.localStorage.getItem("authStatus");
    if (storedStatus) {
      setAuthStatus(storedStatus as AuthenticationStatus);
    }
  }, []);

  function extractEthereumAccount(message: string) {
    // 方法1：使用正则表达式
    const regex = /Ethereum account:\s*([0-9a-fA-Fx]+)/;
    const match = message.match(regex);
    if (match && match[1]) {
      return match[1];
    }
    return "";
  }

  const authenticationAdapter = createAuthenticationAdapter({
    // 获取随机数 (nonce)
    getNonce: async () => {
      try {
        // 向后端请求一个随机数，您需要在后端添加一个生成随机数的接口
        const response = await fetch(`${baseUrl}/auth/nonce`);
        console.log("获取随机数", response);
        if (!response.ok) {
          throw new Error("获取随机数失败");
        }
        const jsonData = (await response.json()) as CommonResponse<string>;
        return jsonData.data;
      } catch (e) {
        console.error("获取随机数失败", e);
        return "";
      }
    },

    // 创建消息
    createMessage: ({ nonce, address, chainId }) => {
      console.log("创建消息", nonce, address, chainId);
      return createSiweMessage({
        domain: window.location.host,
        address,
        statement: "请签名以登录应用",
        uri: window.location.origin,
        version: "1",
        chainId,
        nonce,
      });
    },

    // 验证签名
    verify: async ({ message, signature }) => {
      try {
        console.log("验证签名", message, signature);
        const address = extractEthereumAccount(message);
        setAuthStatus("loading");
        window.localStorage.setItem("authStatus", "loading");
        const verifyRes = await fetch(`${baseUrl}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            address,
            signature,
            message,
          }),
        });

        if (verifyRes.ok) {
          const data = await verifyRes.json();
          // 存储token和session信息
          localStorage.setItem("authToken", data.token);
          localStorage.setItem("sessionId", data.sessionId);
          setAuthStatus("authenticated");
          window.localStorage.setItem("authStatus", "authenticated");
          return true;
        }
        return false;
      } catch (e) {
        console.error("验证签名失败", e);
        return false;
      }
    },

    // 登出
    signOut: async () => {
      const sessionId = localStorage.getItem("sessionId");
      if (sessionId) {
        try {
          await fetch(`${baseUrl}/auth/logout`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId }),
          });

          // 清除本地存储的认证信息
          localStorage.removeItem("authToken");
          localStorage.removeItem("sessionId");
          localStorage.removeItem("authStatus");
          setAuthStatus("unauthenticated");
        } catch (e) {
          console.error("登出失败", e);
        }
      }
    },
  });

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitAuthenticationProvider
          adapter={authenticationAdapter}
          status={authStatus}
        >
          <RainbowKitProvider theme={darkTheme()}>
            {children}
          </RainbowKitProvider>
        </RainbowKitAuthenticationProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
