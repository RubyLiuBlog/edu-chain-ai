"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function App() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    goal: "",
    days: 7,
  });
  const [generationProgress, setGenerationProgress] = useState(0);

  const handleChange = (e: { target: { name: unknown; value: unknown } }) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "days" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 模拟生成过程
    for (let i = 0; i <= 100; i += 10) {
      setGenerationProgress(i);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // 这里应该调用 CourseGenAgent API
    // const response = await fetch('/api/generate-course', {
    //   method: 'POST',
    //   body: JSON.stringify(formData),
    //   headers: { 'Content-Type': 'application/json' }
    // });

    // 完成后跳转
    setTimeout(() => {
      window.location.href = "/target/learn/13131";
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-8">
        <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text">
          创建学习目标
        </h2>

        {isSubmitting ? (
          <div className="flex flex-col items-center">
            <div className="mb-4 text-center">
              <p className="text-lg mb-2">AI 正在生成你的专属课程...</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                请稍候，这可能需要几分钟时间
              </p>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${generationProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {generationProgress}%
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="goal" className="block text-sm font-medium mb-2">
                你的学习目标
              </label>
              <textarea
                id="goal"
                name="goal"
                value={formData.goal}
                onChange={handleChange}
                rows={4}
                placeholder="例如：掌握JavaScript基础知识，理解React框架原理..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 resize-none"
                required
              />
            </div>

            <div>
              <label htmlFor="days" className="block text-sm font-medium mb-2">
                预计学习天数
              </label>
              <input
                type="range"
                id="days"
                name="days"
                min="1"
                max="30"
                value={formData.days}
                onChange={handleChange}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>1天</span>
                <span>{formData.days}天</span>
                <span>30天</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-md shadow hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              生成学习计划
            </motion.button>
          </form>
        )}
      </div>
    </motion.div>
  );
}
