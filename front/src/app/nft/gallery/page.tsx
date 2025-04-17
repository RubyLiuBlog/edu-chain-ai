"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import Link from "next/link";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

export default function MintPage() {
  const { isConnected } = useAccount();
  const [learningProgress, setLearningProgress] = useState(85); // 假设的学习进度
  const [isLoading, setIsLoading] = useState(true);
  const [learningGoal, setLearningGoal] = useState({
    title: "掌握JavaScript基础知识",
    totalTasks: 10,
    completedTasks: 8,
  });

  const [isMinting, setIsMinting] = useState(false);
  const [isWaitingForTransaction, setIsWaitingForTransaction] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [mintError, setMintError] = useState(false);

  // 模拟获取学习数据
  useEffect(() => {
    const fetchLearningData = async () => {
      // 这里应该从API获取实际的学习数据
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    };

    fetchLearningData();
  }, []);

  const handleMint = () => {
    console.log("铸造NFT");
  };

  // 动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text">
              学习成就证明
            </h1>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">
                {learningGoal.title}
              </h2>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${learningProgress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full"
                />
              </div>
              <div className="flex justify-between text-sm">
                <span>{learningProgress}% 完成</span>
                <span>
                  {learningGoal.completedTasks}/{learningGoal.totalTasks} 任务
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium">已完成的任务:</h3>
              <ul className="space-y-2">
                {Array(learningGoal.completedTasks)
                  .fill(0)
                  .map((_, i) => (
                    <motion.li
                      key={i}
                      variants={itemVariants}
                      className="flex items-center text-sm"
                    >
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      <span>完成任务 {i + 1}</span>
                    </motion.li>
                  ))}
                {Array(learningGoal.totalTasks - learningGoal.completedTasks)
                  .fill(0)
                  .map((_, i) => (
                    <motion.li
                      key={i + learningGoal.completedTasks}
                      variants={itemVariants}
                      className="flex items-center text-sm text-gray-500"
                    >
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full mr-2" />
                      <span>
                        未完成任务 {i + learningGoal.completedTasks + 1}
                      </span>
                    </motion.li>
                  ))}
              </ul>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold mb-4">铸造学习成就NFT</h2>

            {learningProgress >= 80 ? (
              <>
                <p className="mb-6 text-green-600 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  恭喜！你已完成超过80%的学习目标，可以铸造成就NFT了！
                </p>

                {!isConnected ? (
                  <p className="text-orange-500 mb-4">
                    请先连接你的钱包来铸造NFT
                  </p>
                ) : mintSuccess ? (
                  <div className="text-green-600 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg mb-4">
                    <p className="font-medium">铸造成功！</p>
                    <p className="text-sm mt-1">
                      你的NFT已铸造完成并添加到你的钱包中。
                    </p>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleMint}
                    disabled={isMinting || isWaitingForTransaction}
                    className={`w-full py-3 px-4 rounded-lg font-medium text-white 
                      ${
                        isMinting || isWaitingForTransaction
                          ? "bg-gray-400"
                          : "bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg"
                      } 
                      transition-all duration-200`}
                  >
                    {isMinting || isWaitingForTransaction ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        铸造中...
                      </span>
                    ) : (
                      "铸造成就NFT"
                    )}
                  </motion.button>
                )}

                {mintError && (
                  <p className="mt-2 text-red-500 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    铸造失败，请重试
                  </p>
                )}
              </>
            ) : (
              <div className="text-orange-500 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <p className="font-medium">还未达到铸造条件</p>
                <p className="text-sm mt-1">
                  完成至少80%的学习目标后可以铸造成就NFT。
                </p>
                <p className="text-sm mt-1">当前进度: {learningProgress}%</p>
              </div>
            )}
          </motion.div>

          <motion.div variants={itemVariants} className="flex justify-center">
            <Link href="/nft/market">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="py-2 px-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
              >
                前往NFT市场
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
