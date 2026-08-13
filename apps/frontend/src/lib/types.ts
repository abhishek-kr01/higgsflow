export type AvatarImage = {
  id: string;
  type: "User" | "Model";
  url: string;
};

export type Avatar = {
  id: string;
  name: string;
  createdAt: string;
  avatarImages: AvatarImage[];
};

export type VideoJob = {
  id: string;
  prompt: string;
  duration: number;
  width: number;
  height: number;
  status: "Pending" | "Processing" | "Done" | "Error";
  outputUrl?: string | null;
  error?: string | null;
  createdAt: string;
};

export type User = {
  id: string;
  username: string;
};
