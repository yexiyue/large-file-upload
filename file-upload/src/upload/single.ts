import { getUploadDom, showList } from "../utils";
import { uploadSingleFormData } from "../api";

const { select, input, tip, list, upload } = getUploadDom("upload1");

let _file: File | null = null;

//1.点击选择按钮触发input的文件选择行为
select?.addEventListener("click", () => {

    //当图片在上传时，阻止选择图片
  if (select.classList.contains("disable")||select?.classList.contains("loading")) {
    return;
  }
  input.click();
});

const show = showList(list); //节省性能版本

//2.监听用户选择的文件
input.addEventListener("change", () => {
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

  //5.显示上传的文件在列表中
  tip.style.display = "none";
  list.style.display = "block";
  show(file.name); //使用闭包，避免重复创建节点

  //保存文件
  _file = file;
});

function clear() {
  tip.style.display = "block";
  list.style.display = "none";
  list.innerHTML = "";
  //移除文件
  _file = null;
}

//6.移除按钮的点击处理
list.addEventListener("click", (ev) => {
  //使用事件委托机制,对动态绑定的事件处理比较容易
  let target = ev.target as HTMLElement;

  if (target.tagName === "EM") {
    //如果事件源是em就进行移除
    clear();
  }
});

//7.上传按钮上传文件
upload?.addEventListener("click", async () => {
    //当图片在上传时，阻止上传图片
  if (upload?.classList.contains("loading")||upload?.classList.contains("disable")) {
    return;
  }

  if (!_file) {
    alert("请选择要上传的文件");
    return;
  }

  try {
    //8.设置按钮样式
    disableHandle(true);
    const res = await uploadSingleFormData(_file);
    if (res.data.code === 0) {
      alert(`文件上传成功，地址：${res.data.servicePath}`);
    } else {
      console.log(res.data);
      alert("文件上传失败，请您稍后再试");
    }
  } catch (error) {
    console.log(error);
  } finally {
    disableHandle(false);
    //最后重置状态
    clear();
    
  }
});

function disableHandle(flag: boolean) {
  if (!flag) {
    select.classList.remove("disable");
    upload?.classList.remove("loading");
  } else {
    select.classList.add("disable");
    upload?.classList.add("loading");
  }
}
