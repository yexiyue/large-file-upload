import { AxiosProgressEvent } from "axios";
import { api } from "./instance";

export const uploadSingleProgress = async (
  file: File,
  cb?: (progressEvent: AxiosProgressEvent) => void
) => {
  //把文件上传到服务器
  const formData = new FormData();
  formData.append("file", file);
  formData.append("filename", file.name);
  //用拦截器做了统一的错误处理
  const res = await api.post("/upload_single", formData, {
    onUploadProgress(progressEvent) {
       cb && cb(progressEvent)
    },
  });
  return res;
};
