import { uploadSingleBase64 } from './../api';
import { getUploadDom, checkIsDisable,fileToBase64 } from "../utils";

const { select, input, } = getUploadDom("upload2");


//1.点击选择按钮触发input的文件选择行为
select?.addEventListener("click", () => {

  //当图片在上传时，阻止选择图片
  if(checkIsDisable(select))return;

  input.click();
});



//2.监听用户选择的文件
input.addEventListener("change", async() => {
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

  //5.转base64
  const base64=await fileToBase64(file)
  disableHandle(true,select)
  try {
    const res=await uploadSingleBase64(encodeURIComponent(base64 as string) ,file.name)
    if(res.code===0){
        return alert(`文件上传成功，预览地址：${res.servicePath}`)
    }
    //抛出异常继续走catch
    throw res
  } catch (error) {
    alert(JSON.stringify(error))
  }finally{
    disableHandle(false,select)
    input.files=null
  }
  
});

function disableHandle(flag: boolean,select:HTMLButtonElement) {
    if (!flag) {
      select.classList.remove("loading");
    } else {
      select.classList.add("loading");
    }
  }
