export default [
  {
    type: 'constructor',
    inputs: [
      {
        name: '_eduToken',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_aiAgent',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'aiAgent',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'chapters',
    inputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'score',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'isCompleted',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'createTarget',
    inputs: [
      {
        name: '_ipfsHash',
        type: 'string',
        internalType: 'string',
      },
      {
        name: '_daysRequired',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_chapterCount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'eduToken',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract IEduToken',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getChapterStatus',
    inputs: [
      {
        name: '_targetId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_chapterIndex',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getTarget',
    inputs: [
      {
        name: '_targetId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct TargetContract.Target',
        components: [
          {
            name: 'user',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'ipfsHash',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'daysRequired',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'chapterCount',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'isCompleted',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'completedDate',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'passingScore',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getTargetProgress',
    inputs: [
      {
        name: '_targetId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'owner',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'renounceOwnership',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setAiAgent',
    inputs: [
      {
        name: '_aiAgent',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'submitChapterScore',
    inputs: [
      {
        name: 'targetId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'chapterIndex',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'score',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'targets',
    inputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'user',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'ipfsHash',
        type: 'string',
        internalType: 'string',
      },
      {
        name: 'daysRequired',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'chapterCount',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'isCompleted',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: 'completedDate',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'passingScore',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'transferOwnership',
    inputs: [
      {
        name: 'newOwner',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    name: 'ChapterScored',
    inputs: [
      {
        name: 'targetId',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
      {
        name: 'chapterIndex',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'score',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'NFTCreated',
    inputs: [
      {
        name: 'user',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'tokenId',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'metadataURI',
        type: 'string',
        indexed: false,
        internalType: 'string',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'OwnershipTransferred',
    inputs: [
      {
        name: 'previousOwner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'newOwner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'TargetCompleted',
    inputs: [
      {
        name: 'targetId',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
      {
        name: 'completionTime',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'TargetCreated',
    inputs: [
      {
        name: 'user',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'targetId',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
      {
        name: 'ipfsHash',
        type: 'string',
        indexed: false,
        internalType: 'string',
      },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'OwnableInvalidOwner',
    inputs: [
      {
        name: 'owner',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'OwnableUnauthorizedAccount',
    inputs: [
      {
        name: 'account',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
] as const;
