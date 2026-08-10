<details>
<summary>AI 使用情况披露</summary>

笔者手动写完全文后交给 DeepSeek V4 Flash 修改了少量错别字、语病与排版不规范之处。笔者保证自己的贡献远大于 AI 的贡献。

</details>

## 前言

你是否还在：

- 使用充满 bug、飘散着腐朽气息的 Dev-C++？
- 写完程序后，编译时才发现有一堆 error；或者使用 VS Code C++ 扩展自带的的错误提示，慢得像蜗牛？
- 死活不知道程序为什么 RE 了？
- 一遍一遍地切换窗口，从浏览器复制样例，粘贴到终端里？

不用慌，今天的教程将带着读者从一个干净的 Windows 11 开始，通过安装并配置 g++、clangd、VS Code 和 CPH-NG 等工具，打造一套方便、现代的 OI 学习环境，逃出上述的困境。

## 安装 msys2、g++ 与 clangd

<details>
<summary>这三个东西是什么？</summary>

- **g++** 是大多数编程竞赛（包括 CCF NOI 系列竞赛）使用的 C++ 编译器。
- **clangd** 是一款高效率的语言服务器，用于在编辑器中提供代码补全、错误提示等。
- **msys2** 用于便捷地安装和管理 g++、clangd 等开发工具，这是一个为 Windows 操作系统提供类 Unix 开发环境的软件发行版和构建平台。

</details>

访问 [msys2 官网的下载页面](https://www.msys2.org/#installation)。对于大多数电脑（x86 架构），点击左侧按钮下载安装包；如果你的电脑是 arm 架构，则点击右侧按钮。
<details>
<summary>如何查看电脑是 x86 架构还是 arm64 架构？</summary>

- 打开「设置」。
- 进入「系统」>「关于」。
- 查看「设备信息」中的「系统类型」：
  - 如果显示「64 位操作系统，基于 x64 的处理器」，为 x86 架构；
  - 如果显示「基于 ARM 的处理器」，则是 arm64 架构。

</details>

<details>
<summary>下载速度太慢怎么办？</summary>

- 方法一：访问 [gh-proxy](https://gh-proxy.com/)，根据提示获取加速链接。
- 方法二：使用 Watt Toolkit 或 dev-sidecar 等工具加速 GitHub。

</details>

运行安装程序，根据提示安装，记住安装路径。在最后一步，取消勾选「Run MSYS2 Now」。

安装完成后，从开始菜单中打开 MSYS2 UCRT64。

先运行以下命令，以切换至国内源：

```bash
sed -i "s#mirror.msys2.org/#mirrors.ustc.edu.cn/msys2/#g" /etc/pacman.d/mirrorlist*
```
然后运行 `pacman -Syu` 更新软件源，一路回车。最后窗口会被自动关闭，属正常现象。

接着配置系统环境变量。打开开始菜单搜索「编辑系统环境变量」，点击「打开」。接着如图所示，点击「环境变量」>「【你的用户名】的用户变量」>「Path」>「编辑」>「新建」，在输入框中输入「`【msys2 的安装路径】\ucrt64\bin`」（默认为 `C:\msys64\ucrt64\bin`）。然后如图点击三个窗口的「确定」。

![](https://cdn.luogu.com.cn/upload/image_hosting/tb605bi7.png)

然后开始安装 g++ 和 clangd。打开 MSYS2 UCRT64，运行

```bash
pacman -S --needed base-devel mingw-w64-ucrt-x86_64-toolchain mingw-w64-ucrt-x86_64-clang-tools-extra
```

一路回车即可。安装完成后运行 `g++ --version` 和 `clangd --version`，如果都能正常输出版本号等内容，说明安装成功。

## 安装 VS Code

访问 [VS Code 官网](https://code.visualstudio.com/)，点击「Download for Windows」，下载安装包。运行安装程序，根据提示安装，建议勾选「将"通过Code打开"操作添加到Windows资源管理器文件上下文菜单」和「将"通过Code打开"操作添加到Windows资源管理器目录上下文菜单」，这样可以在资源管理器中右击文件或文件夹，在 VS Code 中打开。

## 安装 VS Code 扩展

打开 VS Code，点击左侧从上往下第五个图标，打开扩展页面。依次搜索以下扩展并点击「Install」或「安装」：

- Chinese (Simplified) (简体中文) Language Pack for Visual Studio Code
  - VS Code 简体中文语言包。
  - 安装完成后，点击右下角的「Change Language and Restart」。
- C/C++
  - 为 C++ 提供调试。本来还有错误提示、自动补全、符号重命名的功能，但是比较垃圾，这里用 clangd 替代。
- clangd
  - 与刚才安装的 clangd 配合，提供代码补全、高亮、错误提示、符号重命名等。
- CPH-NG
  - 为算法竞赛提供样例测试、爬取测试数据、提交代码等功能。
- C/C++ Themes
  - 为 C/C++ 提供更丰富的代码高亮。
  - 安装完成后，从上方弹窗中的主题中选择一种喜欢的即可。
 
## 配置 clangd 与调试

点击 VS Code 左上角的「文件」>「打开文件夹」，打开一个文件夹作为工作目录。

在左侧的资源管理器窗格中，点击新建文件按钮，创建一个名为 `compile_flags.txt` 的文件，输入

```text
-std=c++26
--target=x86_64-w64-windows-gnu
-IC:/msys64/ucrt64/include
-IC:/msys64/ucrt64/x86_64-w64-mingw32/include
```
并保存。

接着创建一个 C++ 文件。右下角会弹出一个窗口，点击「Don't Show This Warning Again」。然后按下 `Ctrl + Shift + P`，搜索「选择 IntelliSense」配置并点击，点击「使用 g++.exe」。接着按下 `Ctrl + ,` 打开设置，搜索「Intelli Sense Engine」*（原文如此）*，将其改为「Disabled」，并关闭设置。

## 配置代码模板

在文件中输入你常用的代码模板。按下 `F5`，点击「C++ (GDB/LLDB)」，确认其可以正常通过编译。

接着打开 [这个网址](https://www.jyshare.com/front-end/7683/)，将其复制粘贴到左侧的输入框中，点击「转义 JSON」，复制右侧输入框中出现的内容。

回到 VS Code，点击左下角的齿轮按钮 >「代码片段」>「cpp」。在打开的文件中，选中从 `// "Print to console": {` 到下面的第一个 `}` 的全部内容，按下 `Ctrl + /` 取消注释。将 `"prefix": "log"` 中的 `log` 改为你想要的触发词，例如 `cpp`。再将 `"body"` 后边的中括号内的内容替换为一对双引号，在这对双引号中粘贴你刚才从网站上复制的内容。一番操作之后，你的 `cpp.json` 看起来应该像这样：

<details>
<summary>`cpp.json`</summary>

```json
{
	// Place your snippets for cpp here. Each snippet is defined under a snippet name and has a prefix, body and 
	// description. The prefix is what is used to trigger the snippet and the body will be expanded and inserted. Possible variables are:
	// $1, $2 for tab stops, $0 for the final cursor position, and ${1:label}, ${2:another} for placeholders. Placeholders with the 
	// same ids are connected.
	// Example:
	"Print to console": {
		"prefix": "cpp",
		"body": [
			"#include <bits\/stdc++.h>\r\nusing ll = long long;\r\nconst int N = 1e5+10;\r\n\r\nint main() {\r\n    \r\n    return 0;\r\n}"
		],
		"description": "Log output to console"
	}
	//
	// You can also restrict snippets to specific files using include/exclude patterns:
	// "Test snippet": {
	// 	"prefix": "test",
	// 	"body": "test('$1', () => {\n\t$0\n});",
	// 	"include": ["**/*.test.ts", "*.spec.ts"],
	// 	"exclude": ["**/temp/*.ts"],
	// 	"description": "Insert test block"
	// }
}
```

</details>

## 配置 CPH-NG

访问 [Crx搜搜](https://crxsoso.com)，在你使用的浏览器的标签页下搜索 Competitive Companion，下载离线安装包。打开浏览器的扩展管理页面，打开开发者模式，将下载的安装包拖到页面中。
<details>
<summary>为什么不在浏览器扩展商店中安装 Competitive Companion？</summary>

由于我不太清楚的原因，在 Edge 扩展商店中下载的 Competitive Companion 无法正确解析洛谷题目。其它浏览器的情况尚未经过测试。

</details>

然后在浏览器扩展商店中安装 CPH-NG Submit 扩展。

回到 VS Code，点击左侧的 CPH-NG 按钮，一路点击下一步即可。其中你可以根据需求更改编译选项。

在使用 CPH-NG 时，要拉宽左边栏直到不出现下面的蓝色提示为止，否则一些内容将会被隐藏。

## 开始使用

让我们过一下使用这套配置刷题的流程。

首先，打开 VS Code。接着打开 OJ 的题目页面，点击浏览器右上角的扩展按钮 >「Competitive Companion」。回到 VS Code，你会发现已经自动创建了一个空的 `cpp` 文件，左侧的 CPH-NG 扩展中已经出现了样例。

输入你刚才设置的代码片段触发词，按下 `Enter`，就会自动填充代码模板。

然后你开始写代码，clangd 以红色和黄色的波浪线，实时提供错误提示和警告。

写完之后，点击左侧边栏中绿色的运行按钮，将会自动开始测试样例，并返回 AC、WA、TLE 等结果，显示运行时间。

如果 RE 了怎么办？没关系，按下 `F5`，选择「C++ (GDB/LLDB)」，在下面的窗格中切换到「终端」选项卡，输入样例，RE 的位置将会在编辑器中被高亮出来，并附上原因（如「Segmentation fault」是段错误，一般为数组越界；「Arithmetic exception」为算术错误，一般由除以 $0$、对 $0$ 取模等原因造成）。你还可以在左侧切换到第四个选项卡，即「调试」，在「Locals」中查看变量的值，在「调用堆栈」中查看最近调用的函数，或者设置断点。

当一切准备就绪后，点击 CPH-NG 中的「提交」按钮。回到浏览器，你会惊奇地发现已经打开了 OJ 评测结果的页面，你的代码已经被自动提交了。

（关于 CPH-NG、C/C++ 扩展的高级用法请线上搜索或自行探索，在此不再赘述。）

## 后记

本文中关于 clangd 安装和配置的部分参考了 [lll_huge_juruo
](https://www.luogu.com.cn/user/1178294) 大佬的 [VS Code如何让Clangd停止乱报错](https://www.luogu.com.cn/article/fwjzrpzr) 一文，在此表示诚挚的感谢。