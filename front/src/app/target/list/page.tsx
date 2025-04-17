"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

// 模拟数据
const MOCK_TARGETS = [
  {
    id: "1",
    title: "掌握JavaScript基础",
    ipfsHash: "Qm123456789abcdef",
    progress: 75,
    completed: false,
    createdAt: "2025-04-10",
  },
  {
    id: "2",
    title: "学习React框架",
    ipfsHash: "Qm987654321fedcba",
    progress: 100,
    completed: true,
    createdAt: "2025-04-05",
  },
  {
    id: "3",
    title: "理解区块链基础",
    ipfsHash: "QmABCDEF123456789",
    progress: 30,
    completed: false,
    createdAt: "2025-04-12",
  },
];

export default function TargetList() {
  const [targets, setTargets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 模拟API加载
    const loadTargets = async () => {
      // 实际应该从API获取
      // const response = await fetch('/api/targets');
      // const data = await response.json();

      setTimeout(() => {
        setTargets(MOCK_TARGETS);
        setIsLoading(false);
      }, 1500);
    };

    loadTargets();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">我的学习目标</h1>
        <p className="text-gray-600 dark:text-gray-400">
          查看和继续你的学习旅程
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : targets.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-lg">
          <h3 className="text-xl font-medium mb-4">还没有学习目标</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            创建你的第一个学习目标，开始智能学习之旅
          </p>
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="py-2 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-md shadow"
            >
              创建目标
            </motion.button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {targets.map((target, index) => (
            <motion.div
              key={target.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold line-clamp-1">
                    {target.title}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      target.completed
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    }`}
                  >
                    {target.completed ? "已完成" : "学习中"}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    学习进度
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2.5 rounded-full"
                      style={{ width: `${target.progress}%` }}
                    ></div>
                  </div>
                  <div className="text-right text-xs mt-1">
                    {target.progress}%
                  </div>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <div>
                    <span className="font-medium">IPFS哈希:</span>{" "}
                    {target.ipfsHash}
                  </div>
                  <div>
                    <span className="font-medium">创建日期:</span>{" "}
                    {target.createdAt}
                  </div>
                </div>

                <Link href={`/target/learn/${target.id}`} className="block">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-md shadow"
                  >
                    {target.progress > 0 ? "继续学习" : "开始学习"}
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
