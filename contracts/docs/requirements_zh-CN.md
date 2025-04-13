# **EduChain-AI 合约需求文档（完整文字版）**

#### **一、核心合约模块**

1. **TargetContract（学习目标管理合约）**

   - **功能**：
     - 管理用户创建的学习目标（Target）
     - 记录每个章节的完成状态与得分
     - 触发代币奖励与 NFT 铸造
   - **依赖关系**：
     - 与 `EduToken` 合约交互（发放代币）
     - 与 `AchievementNFT` 合约交互（铸造成就 NFT）

2. **EduToken（ERC20 代币合约）**

   - **功能**：
     - 作为学习激励代币（例：EDU）
     - 根据章节测试得分动态发放代币
   - **关键限制**：
     - 仅允许 `TargetContract` 调用 `mint` 方法

3. **AchievementNFT（ERC721 NFT 合约）**
   - **功能**：
     - 铸造用户完成学习目标的成就 NFT
     - 存储 NFT 元数据（IPFS 链接，包含学习成果数据）
   - **关键限制**：
     - 仅允许 `TargetContract` 触发铸造

---

#### **二、数据结构定义**

1. **学习目标（Target）**

   - 用户地址（`user`）
   - 课程大纲 IPFS 哈希（`ipfsHash`）
   - 预计天数（`daysRequired`）
   - 总章节数（`chapterCount`）
   - 整体完成状态（`isCompleted`）
   - **章节状态映射表**：
     - 章节索引 → 章节状态（`chapters`）

2. **章节状态（ChapterStatus）**

   - 得分（`score`，0-100）
   - 是否通过（`isCompleted`，得分 ≥80 时自动标记为 `true`）

3. **NFT 元数据**
   - 学习目标完成时间
   - 最高章节得分
   - 关联课程大纲 IPFS 哈希
   - AI 生成的成就图片 IPFS 链接

---

#### **三、核心功能方法**

##### **1. TargetContract 方法**

- **创建学习目标**

  - 输入：课程大纲 IPFS 哈希、预计天数、章节总数
  - 逻辑：生成唯一 `targetId`，存储目标基础信息

- **提交章节得分（AI Agent 专属）**

  - 输入：目标 ID、章节索引、得分（0-100）
  - 逻辑：
    1. 验证调用者为授权 AI Agent
    2. 更新章节状态（得分与完成标记）
    3. 根据得分发放对应数量代币（80-90:1，90-95:2，95+:3）
    4. 检查所有章节是否通过，若通过则触发 NFT 铸造

- **状态查询方法**
  - `getChapterStatus`：返回指定章节的得分与完成状态
  - `getTargetProgress`：返回目标已通过章节数/总章节数

##### **2. EduToken 方法**

- **代币铸造**
  - 输入：用户地址、代币数量
  - 限制：仅允许 `TargetContract` 调用

##### **3. AchievementNFT 方法**

- **NFT 铸造**
  - 输入：用户地址、目标 ID
  - 逻辑：
    1. 验证调用者为 `TargetContract`
    2. 生成包含学习成果的元数据（存储至 IPFS）
    3. 铸造 NFT 并关联元数据

---

#### **四、权限控制规则**

1. **AI Agent 专属权限**

   - 仅允许预设的 AI Agent 地址调用 `submitChapterScore`

2. **合约间交互权限**

   - `EduToken.mint`：仅允许 `TargetContract` 调用
   - `AchievementNFT.mint`：仅允许 `TargetContract` 调用

3. **管理权限**
   - `setAiAgent`：允许合约所有者更新 AI Agent 地址

---

#### **五、关键事件定义**

1. **TargetCreated**

   - 触发时机：用户创建新学习目标
   - 包含数据：用户地址、目标 ID、IPFS 哈希

2. **ChapterScored**

   - 触发时机：AI Agent 提交章节得分
   - 包含数据：目标 ID、章节索引、得分

3. **TargetCompleted**

   - 触发时机：用户完成所有章节学习
   - 包含数据：目标 ID、完成时间

4. **NFTCreated**
   - 触发时机：成就 NFT 铸造成功
   - 包含数据：用户地址、NFT ID、元数据 IPFS 链接

---

#### **六、安全设计**

1. **防篡改机制**

   - 章节得分仅允许 AI Agent 写入，用户无法自主修改

2. **输入验证**

   - 章节索引需小于目标总章节数（`chapterIndex < chapterCount`）
   - 得分范围强制限制（0 ≤ `score` ≤ 100）

3. **重入攻击防护**

   - 使用 Checks-Effects-Interactions 模式（先更新状态再触发外部调用）

4. **代币防超发**
   - 代币铸造逻辑内置于合约内部流程，无外部调用入口

---

#### **七、链下协同逻辑**

1. **前端数据同步**

   - 通过 `getChapterStatus` 实时渲染章节进度条与得分
   - 监听 `ChapterScored` 事件动态更新 UI

2. **AI Agent 操作流程**

   - 用户提交答案 → AI 评分 → 调用 `submitChapterScore` 写入链上

3. **IPFS 元数据生成**
   - 学习大纲内容由 AI 生成后固定至 IPFS
   - NFT 元数据包含学习时间、得分等可验证数据

---

#### **八、扩展性设计**

1. **多链兼容**

   - 通过抽象合约接口支持 EVM 兼容链（Base、Arbitrum 等）

2. **动态奖励规则**

   - 可升级合约实现代币奖励算法调整（如引入难度系数）

3. **章节类型扩展**
   - 支持为章节添加标签（理论/实践），影响 NFT 元数据生成规则

---

此需求文档定义了完整的合约逻辑框架，确保学习进度追踪、代币激励与 NFT 成就系统的去中心化实现，同时通过严格的权限控制与安全设计保障系统可靠性。
