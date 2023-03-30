import { getAlready, uploadChunk, uploadMerge } from './../api/slice';
import { getUploadDom, checkIsDisable ,fileToArrayBuffer,arrayBufferToHash, getExtension} from "../utils";

/* 大文件切片上传 */
const { select, input, progress } = getUploadDom("upload7");
const value = progress.children[0] as HTMLDivElement;

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

  disableHandle(true, select);
  progress.style.display='block';

  const arrayBuffer=await fileToArrayBuffer(file)
  //获取文件hash
  const hash=arrayBufferToHash(arrayBuffer as ArrayBuffer)
  //获取文件后缀
  const extension=getExtension(file.name)

  /* 获取已经上传的切片信息 */
  let alreadyFileList:string[]=[]
  try {
    const res=await getAlready(hash)
    if(res.code===0){
      alreadyFileList=res.fileList
    }else{
      throw res
    }
  } catch (error) {
    alert(JSON.stringify(error))
  }


  /* 实现文件切片处理（重点）[固定数量 & 固定大小(设置最大切片限制)] */
  let max=1024*100;//每个切片100kb
  let count=Math.ceil(file.size/max);//切片数量
  let index=0;//索引
  const chunks:{
    file:Blob,
    filename:string
  }[]=[];//保存切片的集合

  if(count>100){//如果切片数量大于100了采用固定数量
    max=file.size/100;
    count=100
  }

  /* 根据大小和数量进行切片 */
  while(index<count){
    chunks.push({
      file:file.slice(index*max,(index+1)*max),
      filename:`${hash}_${index}${extension}`
    })
    index++;
  }
  let flag=0
  /* 把每一片上传到服务器 */
  chunks.forEach(item=>{
    //已经上传的无需再上传了
    if(alreadyFileList.length>0 && alreadyFileList.includes(item.filename)){
      complete()
      return;
    }
    uploadChunk(item).then(res=>{
      if(res.code===0){
        complete()
        return
      }
      return Promise.reject(res)
    }).catch((err)=>{
      alert('当前切片上传失败')
      clear()
    })
  })

  /* 上传成功的处理 */
  async function complete(){
    //管控进度
    flag++;
    value.style.width=`${flag/count*100}%`;
    // 当所有切片上传成功，发送合并切片的请求
    if(flag<count)return
    
    value.style.width=`100%`;
    /* 进行合并请求 */
    try {
      const res=await uploadMerge(hash,count)
      console.log(res)
      if(res.code===0){
       return alert(`文件上传成功，地址：${res.path}`);
      }
      throw res
    } catch (error) {
      alert(JSON.stringify(error))
    }finally{
      clear()
    }
  }
});


function disableHandle(flag: boolean, select: HTMLButtonElement) {
  if (!flag) {
    select.classList.remove("loading");
  } else {
    select.classList.add("loading");
  }
}
//恢复默认状态
function clear(){
  disableHandle(false, select);
  progress.style.display='none';
  value.style.width='0'
  input.files=null
}
