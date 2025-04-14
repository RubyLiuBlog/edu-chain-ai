"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount } from "wagmi";
import Image from "next/image";
import { Loader2, Wallet, AlertCircle, CheckCircle } from "lucide-react";

export default function MarketPage() {
  const { address, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(true);
  const [nfts, setNfts] = useState([]);
  const [selectedNft, setSelectedNft] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleRedeem = () => {
    redeemNft({ args: [selectedNft.id, address] });
  };

  const openRedeemModal = (nft) => {
    setSelectedNft(nft);
    setShowModal(true);
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

  const cardVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
    hover: {
      y: -10,
      boxShadow:
        "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: { type: "spring", stiffness: 400, damping: 10 },
    },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 500, damping: 30 },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.2 },
    },
  };

  // 根据稀有度返回对应的颜色类
  const getRarityColor = (rarity) => {
    switch (rarity) {
      case "传奇":
        return "text-orange-500 border-orange-500";
      case "史诗":
        return "text-purple-500 border-purple-500";
      case "稀有":
        return "text-blue-500 border-blue-500";
      default:
        return "text-gray-500 border-gray-500";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text">
          NFT 学习成就市场
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          用你的学习代币兑换独特的AI生成NFT，彰显你的学习成就
        </p>
      </motion.div>

      {isConnected && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex justify-between items-center"
        >
          <div className="flex items-center">
            <Wallet className="w-5 h-5 mr-2 text-blue-500" />
            <span className="font-medium">你的学习代币余额:</span>
          </div>
          <div className="font-bold text-lg bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text">
            {100} TOKEN
          </div>
        </motion.div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {nfts.map((nft) => (
            <motion.div
              key={nft.id}
              variants={cardVariants}
              whileHover="hover"
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
                <Image
                  src={nft.image}
                  alt={nft.name}
                  layout="fill"
                  objectFit="cover"
                  className="transition-transform duration-500 hover:scale-110"
                />
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold">{nft.name}</h3>
                  <span
                    className={`px-2 py-1 text-xs font-medium border rounded-full ${getRarityColor(
                      nft.rarity
                    )}`}
                  >
                    {nft.rarity}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  {nft.description}
                </p>
                <div className="flex justify-between items-center">
                  <div className="font-bold text-lg bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text">
                    {nft.price} TOKEN
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openRedeemModal(nft)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-200"
                  >
                    兑换NFT
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* 兑换确认弹窗 */}
      <AnimatePresence>
        {showModal && selectedNft && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold mb-4">确认兑换</h3>

              {redeemSuccess ? (
                <div className="text-center py-4">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h4 className="text-lg font-medium mb-2">兑换成功！</h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    NFT「{selectedNft.name}」已经添加到你的钱包
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium"
                  >
                    关闭
                  </motion.button>
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden relative">
                      <Image
                        src={selectedNft.image}
                        alt={selectedNft.name}
                        layout="fill"
                        objectFit="cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium">{selectedNft.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedNft.rarity}
                      </p>
                      <p className="font-bold text-blue-600 dark:text-blue-400">
                        {selectedNft.price} TOKEN
                      </p>
                    </div>
                  </div>

                  {parseFloat(userBalance) < selectedNft.price ? (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4">
                      <p className="flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        代币余额不足
                      </p>
                      <p className="text-sm mt-1">
                        你需要至少 {selectedNft.price} TOKEN 来兑换此NFT。
                      </p>
                    </div>
                  ) : (
                    <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 p-3 rounded-lg mb-4">
                      <p>确认后将从你的账户扣除 {selectedNft.price} TOKEN。</p>
                    </div>
                  )}

                  {redeemError && (
                    <p className="text-red-500 text-sm mb-4">
                      兑换失败，请重试
                    </p>
                  )}

                  <div className="flex space-x-3 justify-end">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg"
                    >
                      取消
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleRedeem}
                      disabled={
                        parseFloat(userBalance) < selectedNft.price ||
                        isRedeeming ||
                        isWaitingForTransaction
                      }
                      className={`px-4 py-2 rounded-lg text-white font-medium flex items-center justify-center
                        ${
                          parseFloat(userBalance) < selectedNft.price ||
                          isRedeeming ||
                          isWaitingForTransaction
                            ? "bg-gray-400"
                            : "bg-gradient-to-r from-blue-500 to-purple-600"
                        }`}
                    >
                      {isRedeeming || isWaitingForTransaction ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          处理中...
                        </>
                      ) : (
                        "确认兑换"
                      )}
                    </motion.button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
