"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// 模拟课程数据
const MOCK_COURSE = {
  id: "1",
  title: "掌握JavaScript基础",
  chapters: [
    {
      id: "chapter-1",
      title: "变量与数据类型",
      content: `
## 变量与数据类型

JavaScript 中的变量是存储数据值的容器。JavaScript 是一种动态类型语言，这意味着相同的变量可用于存储不同的数据类型。

### 变量声明

在 JavaScript 中，可以使用 \`var\`、\`let\` 或 \`const\` 关键字声明变量：

\`\`\`javascript
// 使用 var（旧方式，函数作用域）
var name = "John";

// 使用 let（块作用域，可重新赋值）
let age = 25;

// 使用 const（块作用域，不可重新赋值）
const PI = 3.14;
\`\`\`

### JavaScript 的基本数据类型

1. **String**（字符串）：表示文本数据
   \`\`\`javascript
   let greeting = "Hello, World!";
   \`\`\`

2. **Number**（数字）：表示数值
   \`\`\`javascript
   let count = 42;
   let price = 19.99;
   \`\`\`

3. **Boolean**（布尔值）：true 或 false
   \`\`\`javascript
   let isActive = true;
   let isComplete = false;
   \`\`\`

4. **Undefined**：变量已声明但未赋值
   \`\`\`javascript
   let undefinedVar;
   console.log(undefinedVar); // undefined
   \`\`\`

5. **Null**：表示空或不存在的值
   \`\`\`javascript
   let emptyValue = null;
   \`\`\`

6. **Symbol**（ES6 新增）：表示唯一的、不可变的值
   \`\`\`javascript
   let uniqueKey = Symbol("description");
   \`\`\`

7. **BigInt**（较新）：表示任意精度的整数
   \`\`\`javascript
   let bigNumber = 1234567890123456789012345n;
   \`\`\`

### 复合数据类型

1. **Object**（对象）：键值对的集合
   \`\`\`javascript
   let person = {
     name: "Alice",
     age: 30,
     isStudent: false
   };
   \`\`\`

2. **Array**（数组）：有序列表
   \`\`\`javascript
   let fruits = ["Apple", "Banana", "Cherry"];
   \`\`\`

3. **Function**（函数）：可执行代码块
   \`\`\`javascript
   function greet(name) {
     return "Hello, " + name + "!";
   }
   \`\`\`

### 类型检查与转换

使用 \`typeof\` 运算符检查变量的类型：
\`\`\`javascript
let num = 42;
console.log(typeof num); // "number"
\`\`\`

类型转换：
\`\`\`javascript
// 字符串转数字
let str = "42";
let num1 = Number(str);
let num2 = parseInt(str);

// 数字转字符串
let num = 42;
let str1 = String(num);
let str2 = num.toString();
\`\`\`
      `,
    },
    {
      id: "chapter-2",
      title: "运算符与表达式",
      content: `
## 运算符与表达式

JavaScript 中的运算符用于对变量和值执行操作。表达式是由值、变量和运算符组合而成，并能被计算得到一个值。

### 算术运算符

用于执行数学运算：

\`\`\`javascript
let a = 10;
let b = 3;

// 加法
let sum = a + b; // 13

// 减法
let difference = a - b; // 7

// 乘法
let product = a * b; // 30

// 除法
let quotient = a / b; // 3.3333...

// 取模（余数）
let remainder = a % b; // 1

// 递增
a++; // a 变为 11

// 递减
b--; // b 变为 2

// 幂运算（ES2016）
let power = a ** b; // 10^3 = 1000
\`\`\`

### 赋值运算符

用于给变量赋值：

\`\`\`javascript
let x = 10;

// 加法赋值
x += 5; // 等同于 x = x + 5; 结果：15

// 减法赋值
x -= 3; // 等同于 x = x - 3; 结果：12

// 乘法赋值
x *= 2; // 等同于 x = x * 2; 结果：24

// 除法赋值
x /= 4; // 等同于 x = x / 4; 结果：6

// 取模赋值
x %= 4; // 等同于 x = x % 4; 结果：2
\`\`\`

### 比较运算符

用于比较两个值：

\`\`\`javascript
let a = 5;
let b = "5";

// 相等（值相等）
console.log(a == b); // true

// 严格相等（值和类型都相等）
console.log(a === b); // false

// 不相等
console.log(a != b); // false

// 严格不相等
console.log(a !== b); // true

// 大于
console.log(a > 3); // true

// 小于
console.log(a < 10); // true

// 大于等于
console.log(a >= 5); // true

// 小于等于
console.log(a <= 4); // false
\`\`\`

### 逻辑运算符

用于组合条件：

\`\`\`javascript
let x = 5;
let y = 10;

// 逻辑与（AND）- 所有条件都为真时返回真
console.log(x > 0 && y > 0); // true

// 逻辑或（OR）- 任一条件为真时返回真
console.log(x < 0 || y > 0); // true

// 逻辑非（NOT）- 反转布尔值
console.log(!(x > 0)); // false
\`\`\`

### 三元（条件）运算符

提供一种简洁的方式来编写条件表达式：

\`\`\`javascript
let age = 20;
let status = (age >= 18) ? "成年" : "未成年";
console.log(status); // "成年"
\`\`\`

### 类型运算符

\`\`\`javascript
// typeof 返回变量的数据类型
console.log(typeof 42); // "number"
console.log(typeof "Hello"); // "string"

// instanceof 检查对象是否是特定类的实例
let date = new Date();
console.log(date instanceof Date); // true
\`\`\`

### 位运算符

用于处理二进制数：

\`\`\`javascript
// 按位与（AND）
console.log(5 & 1); // 1

// 按位或（OR）
console.log(5 | 1); // 5

// 按位异或（XOR）
console.log(5 ^ 1); // 4

// 按位非（NOT）
console.log(~5); // -6

// 左移
console.log(5 << 1); // 10

// 右移
console.log(5 >> 1); // 2
\`\`\`

### 运算符优先级

JavaScript 中的运算符遵循一定的优先级规则，可以使用括号 \`()\` 来明确指定运算顺序：

\`\`\`javascript
// 乘法优先级高于加法
let result = 2 + 3 * 4; // 14，而不是 20

// 使用括号改变优先级
let modifiedResult = (2 + 3) * 4; // 20
\`\`\`
      `,
    },
    {
      id: "chapter-3",
      title: "流程控制语句",
      content: `
## 流程控制语句

流程控制语句允许根据指定的条件来改变代码的执行顺序。JavaScript 提供了多种流程控制结构，包括条件语句、循环语句和跳转语句。

### 条件语句

#### if...else 语句

根据条件执行不同的代码块：

\`\`\`javascript
let hour = new Date().getHours();

if (hour < 12) {
  console.log("早上好！");
} else if (hour < 18) {
  console.log("下午好！");
} else {
  console.log("晚上好！");
}
\`\`\`

#### switch 语句

基于不同的条件执行不同的代码块：

\`\`\`javascript
let day = new Date().getDay();
let dayName;

switch (day) {
  case 0:
    dayName = "星期日";
    break;
  case 1:
    dayName = "星期一";
    break;
  case 2:
    dayName = "星期二";
    break;
  case 3:
    dayName = "星期三";
    break;
  case 4:
    dayName = "星期四";
    break;
  case 5:
    dayName = "星期五";
    break;
  case 6:
    dayName = "星期六";
    break;
  default:
    dayName = "未知日期";
}

console.log("今天是 " + dayName);
\`\`\`

### 循环语句

#### for 循环

重复执行代码块指定的次数：

\`\`\`javascript
// 基本 for 循环
for (let i = 0; i < 5; i++) {
  console.log("循环计数：" + i);
}

// 遍历数组
let fruits = ["苹果", "香蕉", "橙子"];
for (let i = 0; i < fruits.length; i++) {
  console.log(fruits[i]);
}
\`\`\`

#### for...in 循环

遍历对象的属性：

\`\`\`javascript
let person = {
  name: "小明",
  age: 25,
  job: "开发者"
};

for (let key in person) {
  console.log(key + ": " + person[key]);
}
\`\`\`

#### for...of 循环

遍历可迭代对象（如数组、字符串）的元素：

\`\`\`javascript
let colors = ["红色", "绿色", "蓝色"];

for (let color of colors) {
  console.log(color);
}

// 遍历字符串
let greeting = "你好";
for (let char of greeting) {
  console.log(char);
}
\`\`\`

#### while 循环

当指定条件为真时重复执行代码块：

\`\`\`javascript
let count = 0;

while (count < 5) {
  console.log("当前计数：" + count);
  count++;
}
\`\`\`

#### do...while 循环

先执行代码块，然后在指定条件为真时重复执行：

\`\`\`javascript
let i = 0;

do {
  console.log("当前计数：" + i);
  i++;
} while (i < 5);
\`\`\`

### 跳转语句

#### break 语句

终止循环或 switch 语句：

\`\`\`javascript
for (let i = 0; i < 10; i++) {
  if (i === 5) {
    break; // 当 i 等于 5 时终止循环
  }
  console.log(i);
}
// 输出：0, 1, 2, 3, 4
\`\`\`

#### continue 语句

跳过循环的当前迭代，继续下一次迭代：

\`\`\`javascript
for (let i = 0; i < 10; i++) {
  if (i % 2 === 0) {
    continue; // 跳过偶数
  }
  console.log(i);
}
// 输出：1, 3, 5, 7, 9
\`\`\`

#### return 语句

退出当前函数，并可选地返回一个值：

\`\`\`javascript
function checkAge(age) {
  if (age >= 18) {
    return "成年人";
  }
  return "未成年人";
}

console.log(checkAge(20)); // "成年人"
console.log(checkAge(16)); // "未成年人"
\`\`\`

#### throw 语句

抛出一个用户定义的异常：

\`\`\`javascript
function divide(a, b) {
  if (b === 0) {
    throw "除数不能为零！";
  }
  return a / b;
}

try {
  console.log(divide(10, 2)); // 5
  console.log(divide(10, 0)); // 抛出异常
} catch (error) {
  console.log("发生错误: " + error);
}
\`\`\`

### try...catch...finally 语句

处理代码中可能出现的异常：

\`\`\`javascript
try {
  // 尝试执行的代码
  let result = someNonExistentFunction();
  console.log(result);
} catch (error) {
  // 处理错误
  console.log("发生错误: " + error.message);
} finally {
  // 无论如何都会执行的代码
  console.log("这部分代码总是会执行");
}
\`\`\`
      `,
    },
  ],
};

// 模拟测试数据
const MOCK_TEST = {
  title: "JavaScript 变量与数据类型测试",
  questions: [
    {
      id: "q1",
      type: "single",
      question: "在 JavaScript 中，以下哪个关键字声明的变量不能被重新赋值？",
      options: [
        { id: "a", text: "var" },
        { id: "b", text: "let" },
        { id: "c", text: "const" },
        { id: "d", text: "function" },
      ],
      correctAnswer: "c",
    },
    {
      id: "q2",
      type: "multiple",
      question: "以下哪些是 JavaScript 的基本数据类型？（选择所有适用的）",
      options: [
        { id: "a", text: "String" },
        { id: "b", text: "Array" },
        { id: "c", text: "Boolean" },
        { id: "d", text: "Object" },
      ],
      correctAnswer: ["a", "c"],
    },
    {
      id: "q3",
      type: "text",
      question: "简述 JavaScript 中 `==` 和 `===` 运算符的区别。",
      correctAnswer:
        "== 是相等运算符，比较两个值是否相等，会进行类型转换；=== 是严格相等运算符，不仅比较值是否相等，还会比较类型是否相同，不进行类型转换。",
    },
  ],
};

export default function LearnPage() {
  const params = useParams();
  const { id } = params;

  const [course, setCourse] = useState<typeof MOCK_COURSE | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [showTest, setShowTest] = useState(false);
  const [test, setTest] = useState(null);
  const [testLoading, setTestLoading] = useState(false);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [testScore, setTestScore] = useState(0);
  const [earnedTokens, setEarnedTokens] = useState(0);

  useEffect(() => {
    // 模拟加载课程数据
    const loadCourse = async () => {
      // 实际应该从API获取，基于IPFS哈希
      // const response = await fetch(`/api/course/${id}`);
      // const data = await response.json();

      setTimeout(() => {
        setCourse(MOCK_COURSE);
        setIsLoading(false);
      }, 1500);
    };

    loadCourse();
  }, [id]);

  const handleChapterChange = (index) => {
    setCurrentChapterIndex(index);
    setShowTest(false);
    setShowResults(false);
  };

  const handleStartTest = async () => {
    setTestLoading(true);
    setShowTest(true);

    // 模拟API调用生成测试题
    // const response = await fetch(`/api/generate-test`, {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     courseId: id,
    //     chapterId: course.chapters[currentChapterIndex].id
    //   }),
    //   headers: { 'Content-Type': 'application/json' }
    // });
    // const data = await response.json();

    setTimeout(() => {
      setTest(MOCK_TEST);
      setTestLoading(false);
      setAnswers({});
    }, 2000);
  };

  const handleAnswerChange = (questionId, value, isMultiple = false) => {
    if (isMultiple) {
      setAnswers((prev) => {
        const currentAnswers = prev[questionId] || [];
        if (currentAnswers.includes(value)) {
          return {
            ...prev,
            [questionId]: currentAnswers.filter((item) => item !== value),
          };
        } else {
          return {
            ...prev,
            [questionId]: [...currentAnswers, value],
          };
        }
      });
    } else {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: value,
      }));
    }
  };

  const handleTestSubmit = () => {
    // 计算得分
    let correctCount = 0;

    test.questions.forEach((question) => {
      const userAnswer = answers[question.id];

      if (question.type === "multiple") {
        // 多选题需要完全匹配
        if (
          userAnswer &&
          Array.isArray(userAnswer) &&
          userAnswer.length === question.correctAnswer.length &&
          question.correctAnswer.every((ans) => userAnswer.includes(ans))
        ) {
          correctCount++;
        }
      } else if (question.type === "text") {
        // 简答题很难精确评分，这里采用简单的包含关键词判断
        // 实际应用中应该使用更复杂的NLP或AI评分
        if (userAnswer && userAnswer.toLowerCase().includes("类型")) {
          correctCount++;
        }
      } else {
        // 单选题
        if (userAnswer === question.correctAnswer) {
          correctCount++;
        }
      }
    });

    const score = Math.round((correctCount / test.questions.length) * 100);
    const tokens = Math.ceil(score / 10); // 简单计算获得的tokens

    setTestScore(score);
    setEarnedTokens(tokens);
    setShowResults(true);

    // 实际应用中应该调用API保存结果
    // fetch('/api/save-test-result', {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     courseId: id,
    //     chapterId: course.chapters[currentChapterIndex].id,
    //     score,
    //     earnedTokens: tokens
    //   }),
    //   headers: { 'Content-Type': 'application/json' }
    // });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  const currentChapter = course?.chapters[currentChapterIndex];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{course.title}</h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* 侧边栏导航 */}
        <div className="md:w-1/4 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
          <h2 className="font-bold text-xl mb-4">章节</h2>
          <ul className="space-y-2">
            {course.chapters.map((chapter, index) => (
              <li key={chapter.id}>
                <button
                  onClick={() => handleChapterChange(index)}
                  className={`w-full text-left py-2 px-3 rounded-md transition-colors ${
                    currentChapterIndex === index
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {index + 1}. {chapter.title}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* 主要内容区 */}
        <div className="md:w-3/4">
          <AnimatePresence mode="wait">
            {showTest ? (
              <motion.div
                key="test"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
              >
                {testLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-lg">正在生成测试题...</p>
                  </div>
                ) : showResults ? (
                  <div className="text-center py-8">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                      }}
                      className="mb-6"
                    >
                      <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-3xl font-bold">
                        {testScore}%
                      </div>
                    </motion.div>

                    <h2 className="text-2xl font-bold mb-4">测试完成!</h2>

                    {testScore >= 70 ? (
                      <div className="mb-6">
                        <p className="text-green-600 dark:text-green-400 text-lg font-medium mb-2">
                          恭喜，你已通过此章节测试！
                        </p>
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          className="mb-4"
                        >
                          <p className="text-lg">
                            你获得了{" "}
                            <span className="text-yellow-500 font-bold text-xl">
                              {earnedTokens} 个
                            </span>{" "}
                            学习代币！
                          </p>
                        </motion.div>
                      </div>
                    ) : (
                      <p className="text-orange-600 dark:text-orange-400 mb-6">
                        还需要多加练习哦，再接再厉！
                      </p>
                    )}

                    <div className="flex justify-center space-x-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowTest(false)}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow"
                      >
                        返回学习
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleStartTest}
                        className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md shadow"
                      >
                        重新测试
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold">{test.title}</h2>
                      <button
                        onClick={() => setShowTest(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        返回学习
                      </button>
                    </div>

                    <div className="space-y-8">
                      {test.questions.map((question, index) => (
                        <div key={question.id} className="border-b pb-6">
                          <h3 className="font-medium mb-3">
                            问题 {index + 1}：{question.question}
                          </h3>

                          {question.type === "single" && (
                            <div className="space-y-2">
                              {question.options.map((option) => (
                                <div
                                  key={option.id}
                                  className="flex items-center"
                                >
                                  <input
                                    type="radio"
                                    id={`${question.id}-${option.id}`}
                                    name={question.id}
                                    value={option.id}
                                    checked={answers[question.id] === option.id}
                                    onChange={(e) =>
                                      handleAnswerChange(
                                        question.id,
                                        e.target.value
                                      )
                                    }
                                    className="mr-2"
                                  />
                                  <label
                                    htmlFor={`${question.id}-${option.id}`}
                                  >
                                    {option.text}
                                  </label>
                                </div>
                              ))}
                            </div>
                          )}

                          {question.type === "multiple" && (
                            <div className="space-y-2">
                              {question.options.map((option) => (
                                <div
                                  key={option.id}
                                  className="flex items-center"
                                >
                                  <input
                                    type="checkbox"
                                    id={`${question.id}-${option.id}`}
                                    name={`${question.id}-${option.id}`}
                                    value={option.id}
                                    checked={(
                                      answers[question.id] || []
                                    ).includes(option.id)}
                                    onChange={(e) =>
                                      handleAnswerChange(
                                        question.id,
                                        e.target.value,
                                        true
                                      )
                                    }
                                    className="mr-2"
                                  />
                                  <label
                                    htmlFor={`${question.id}-${option.id}`}
                                  >
                                    {option.text}
                                  </label>
                                </div>
                              ))}
                            </div>
                          )}

                          {question.type === "text" && (
                            <textarea
                              rows={4}
                              placeholder="请输入你的回答..."
                              value={answers[question.id] || ""}
                              onChange={(e) =>
                                handleAnswerChange(question.id, e.target.value)
                              }
                              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 text-center">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleTestSubmit}
                        className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md shadow-md font-medium"
                      >
                        提交答案
                      </motion.button>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">{currentChapter.title}</h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleStartTest}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md shadow"
                  >
                    进行测试
                  </motion.button>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg prose dark:prose-invert max-w-none">
                  <div
                    className="markdown-content"
                    dangerouslySetInnerHTML={{
                      __html: currentChapter.content,
                    }}
                  ></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
