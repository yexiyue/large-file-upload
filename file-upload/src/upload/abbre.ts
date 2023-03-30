import { uploadSingleName } from "./../api";
import SparkMD5 from "spark-md5";
import {
  getUploadDom,
  checkIsDisable,
  disableHandle,
  fileToArrayBuffer,
  arrayBufferToHash,
  getExtension
} from "../utils";

const { select, input, abbreviation, upload } = getUploadDom("upload3");
const img = abbreviation.getElementsByTagName("img")[0];
let _file: File | null = null;
//1.点击选择按钮触发input的文件选择行为
select?.addEventListener("click", () => {
  //当图片在上传时，阻止选择图片
  if (checkIsDisable(select)) return;

  input.click();
});

//2.监听用户选择的文件
input.addEventListener("change", async () => {
  const file = input.files![0];
  //如果没文件就返回，下面代码不执行
  if (!file) return;

  //3.限制上传格式 可以配合input accept属性
  if (!/(jpg|png|jpeg)/i.test(file.type)) {
    alert("上传的图片只能是png,jpg,jpeg等格式");
    return;
  }

  //4.限制文件上传大小
  if (file.size > 2 * 1024 * 1024) {
    alert("上传的图片不能大于2MB");
    return;
  }

  _file = file; //保存文件

  //5.文件预览
  const preview = URL.createObjectURL(file);
  abbreviation.style.display = "block";
  img.src = preview;
  //(也可以使用base64)
  /* const base64 = await fileToBase64(file);
  img.src = base64 as string; */
});

//6.上传按钮上传文件
upload?.addEventListener("click", async () => {
  //当图片在上传时，阻止上传图片
  if (checkIsDisable(upload)) {
    return;
  }

  if (!_file) {
    alert("请选择要上传的文件");
    return;
  }

  disableHandle(true, select, upload);
  try {
    //把文件转换成arraybuffer
    const arrayBuffer=await fileToArrayBuffer(_file) as ArrayBuffer
    //根据文件生成唯一的hash
    const hash=arrayBufferToHash(arrayBuffer)
    //获取文件后缀
    const extension=getExtension(_file.name)
    //组合成唯一的文件名
    const filename=hash+extension
    //7.调用接口上传到服务器
    const res=await uploadSingleName(_file,filename)
    if (res.code === 0) {
       return alert(`文件上传成功，地址：${res.servicePath}`);
    }
    throw res
  } catch (error) {
    alert(JSON.stringify(error))
  }finally{
    //恢复初始状态
    disableHandle(false, select, upload);
    abbreviation.style.display='none'
    img.src=''
    _file=null
    input.files=null
  }
});
