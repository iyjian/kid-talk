export * from './request.dto';
export * from './response.dto';

export enum USER_TYPE {
  STUDENT = 1,
  TEACHER = 2,
}

export enum QUESTION_STATUS {
  // 0 - 未标记
  INITIAL = 0,
  // 1 - 已解决
  SOLVED = 1,
  //  2- 不懂 (现在不用)
  LACKOFUNDERSTANDING = 2,
  // 3 - 未解决
  UNSOLVED = 3,
}

export enum QUESTION_MESSAGE_STATUS {
  //0 - 无新消息
  NO_NEW_MESSAGE = 0,
  //1 - 有新消息
  NEW_MESSAGE = 1,
}

export enum ANSWER_TYPE {
  // 1 - 问题
  QUESTION = 1,
  // 2 - 追问
  FOLLOWUPQUESTION = 2,
  // 3 - AI回答
  AIANSWER = 3,
  // 4 - 补充回答
  SUPPLEMENT = 4,
  // 5 - 图片问题
  IMGQUESTION = 5,
  // 6 - 图片回答
  IMGANSWER = 6,
}

export enum DIFFICULTY {
  // 1 - 很简单
  VERY_EASY = 1,
  // 2 - 简单
  EASY = 2,
  // 3 - 一般
  NORMAL = 3,
  // 4 - 困难
  HARD = 4,
  // 5 - 很难
  VERY_HARD = 5,
}

export enum RESOURCE_TYPE {
  // 1 - 知识点
  KNOWLEDGE = 1,
  // 2 - 技能点
  SKILL = 2,
  // 3 - 案例
  CASE = 3,
}

export enum CLIENT_TYPE {
  //学生端
  STUDENT = 1,
  //教师端
  TEACHER = 2,
  //网页
  WEB = 3,
}

export interface USER {
  id: number;
  isAdmin: boolean;
  member: {
    id: number;
    type: number;
    organizationId: number;
    organization: {
      id: number;
      name: string;
    };
    validityDays?: number;
  };
}

export const SUPER_ADMIN_USER: USER = {
  id: 1,
  isAdmin: true,
  member: {
    id: 1,
    type: 2,
    organizationId: 1,
    organization: {
      id: 1,
      name: 'jcjy',
    },
    validityDays: 999999,
  },
};

// 1 - FPS题 2 - 客观题 3 - 判断题 4 - 主观题 5 - 多选题
export enum PROBLEM_TYPE {
  FPS = 1,
  SINGLE_CHOICE = 2,
  JUDGE = 3,
  SUBJECTIVE = 4,
  MULTIPLE_CHOICE = 5,
}

export const iv = '4398d6f74f48cce1837906b8be577fc8';
export const key =
  '3353cfe9550a892fca352069822c1e86eb3735e750d1c58e704a52bef47605ed';
