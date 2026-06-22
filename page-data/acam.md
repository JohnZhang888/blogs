*本文原作于 2025 年 11 月 13 日。*

> 最智慧的，不是避免所有失败，而是在失配时借力转向，让每一次跌倒都成为新模式的起点。—— 题记

其实我两周前就学了 AC 自动机，本来不应该现在才写这个笔记的。但是当时对 AC 自动机的理解比较模糊，直到刚才听了风又引理的网课，才对 AC 自动机有了更深刻的理解，所以现在把这篇笔记补上。

## 前置知识

- 字典树
- KMP
- 一定的思维能力

## 问题引入

如何在一个字符串中快速找到 **一个** 模式串的位置？使用 KMP 算法即可。

那么如何在一个字符串中快速找到 **多个** 模式串的位置？可以想到跑多次 KMP 算法，但是时间复杂度为 $(\textrm{目标串长度} + \textrm{模式串长度}) \times \textrm{模式串数量}$，一旦模式串数量较多，将会非常吃力。

回想 KMP 算法的过程，我们用一个模式串去尝试匹配字符串。那么，我们是否可以 **把多个模式串缩合成一个东西**，然后一起去匹配？很容易想到**字典树**。

于是就要引出我们今天的主角 —— **AC 自动机**，这是一种基于字典树和 KMP 算法思想的多模字符串匹配算法。

## 算法介绍

假如我们的模式串为 $\texttt{i, he, his, sha, hers}$，可以搭建出如下一棵字典树：

![](https://tu.zshfoj.com/i/322)

假如我们的目标串是 $\texttt{shers}$（原谅我编了如此奇怪的单词）。我们从字典树的根节点开始匹配：$\texttt{s}$，成功；$\texttt{h}$，成功 —— 但是 $\texttt{h}$ 后面没有 $\texttt{e}$ 了，难道我们要回到根节点重新开始匹配吗？仔细观察可以发现：我们目前已经扫描的目标串子串 $\texttt{sh}$ 的后缀 $\texttt{h}$ 恰好也是字典树的一个前缀！那么，我们只需要将当前位置移到节点 $1$ 前的那个 $\texttt{h}$ 边就可以继续匹配了，无需从头开始。

那么，我们可以想到，为树上的每条边 $u$ 创建一个指向 $v$ 的指针，满足 **字典树根节点到 $v$ 的路径，恰好是根节点到 $u$ 路径的后缀**。每当我们在 $u$ 处匹配失败，就前往 $v$ 继续匹配。这就是大名鼎鼎的 **Fail 指针**。

![](https://tu.zshfoj.com/i/323)

那我们具体如何构建 Fail 指针呢？我们可以按 **层级**（也就是 BFS 序）遍历字典树，按以下步骤构建：

- 根节点和其下每个儿子的 Fail 指针指向根节点。
- 对于其它节点，如果其父节点的 Fail 指针指向的节点 $u$ 的儿子有与其字母相同的，就指向它；否则再抵达 $u$ 的 Fail 指针指向的节点去寻找，循环进行，直到找到符合要求的节点或者根节点。

很好，你理论上已经可以做 [洛谷 P5357 【模板】AC 自动机](https://www.luogu.com.cn/problem/P5357) 这道题了，快去试试吧！

## 优化

什么，你跟我说，你按照我的做法来做，结果全都 T 飞了？这就对了，因为我是有设计的。~~欸欸欸别打我啊，我这叫循序渐进地讲解。~~

让我们尝试进行一些优化。

我们目前的策略是，当在某处匹配失败后，就去找该位置的 Fail 指针。这既不简洁也很慢。既然如此，我们可以 **为无法匹配的字母建边，指向原本的 Fail 指针下的相同字母。**

![](https://tu.zshfoj.com/i/324)

这样不仅使跳转 fail 指针的过程更加简洁明了，也进行了路径压缩，提升了运行效率。

然而，当你尝试将如此优化后的代码提交时，会发现还是会 TLE。我们从洛谷题解那边偷一张图来解释一下：

![](https://i.loli.net/2019/05/02/5ccaaa22cbf29.png)

为了找到目标串中每个模式串出现的次数，我们先找到点 $4$，其 fail 指针指向 $9$，那么若想更新 $4$ 的值（在目标串中的出现次数），同时也要更新 $7$ 和 $9$。我们下一次找到节点 $7$ 还要再次更新节点 $9$，节点 $9$ 被更新了两次，时间复杂度就在这里被浪费了。

考虑在找到的点打一个标记，最后再 **一次性** 地将标记全部上传来更新其它点的答案。但是如何确定更新顺序呢？显然，我们打了标记后是从深度大的点开始更新的，所以更新顺序就是由深度大的到深度小的。实现方式明显是 **拓扑排序。**

你可能会说：拓扑排序不是在有向无环图上进行的吗？这里哪儿有有向无环图？如果我们把 fail 指针当作有向边，那么所有的指针就会构成一幅有向无环图，也就是所谓的 **fail 树**。

好了，现在你终于可以通过这道模板题了。

[跳过代码](#进一步理解)

```cpp
#include <bits/stdc++.h>
typedef long long ll;
const int N = 2e5+10;
int n, vis[N], ans, in[N], map[N] /*每个字符串在字典树中结束位置的编号*/;
struct Node {
  int fail, end /*在此处结尾的字符串编号*/, pos[30], ans /*这个模式串在目标串中出现的次数*/;
  void clear() {
    std::memset(pos, 0, sizeof(pos));
    fail = end = ans = 0;
  }
} ac[N];
int cnt = 0;
int getNum(char ch) {
  return ch - 'a';
}

void insert(std::string str, int num) {
  int p = 0, l = str.size();
  for (int i = 0; i < l; i++) {
    int c = getNum(str[i]);
    if (!ac[p].pos[c]) {
      ac[p].pos[c] = ++cnt;
    }
    p = ac[p].pos[c];
  }
  if (!ac[p].end) ac[p].end = num;
  map[num] = ac[p].end;
}

void buildFail() {
  std::queue<int> q;
  // 将根节点的所有儿子加入队列，并将其指针指向根节点。
  for (int i = 0; i < 26; i++) {
    if (ac[0].pos[i]) {
      q.push(ac[0].pos[i]);
      ac[ac[0].pos[i]].fail = 0;
      in[0]++; // 每当一个节点成为 fail 指针的终点，就增加其入度，以便后续的拓扑排序。
    } else {
      ac[0].pos[i] = 0;
    }
  }  
  while (!q.empty()) {
    int u = q.front();
    q.pop();
    int fail = ac[u].fail; // 其父亲的 fail 指针指向的节点
    for (int i = 0; i < 26; i++) {
      int v = ac[u].pos[i];
      if (v) {
        ac[v].fail = ac[fail].pos[i]; // 如果下面有相同字母
        in[ac[v].fail]++;
        q.push(v);
      } else {
        ac[u].pos[i] = ac[fail].pos[i]; // 增加新边，即上图的蓝色边
      }
    }
  }
}

// 拓扑排序
void topo() {
  std::queue<int> q;
  for (int i = 0; i <= cnt; i++) {
    if (in[i] == 0) q.push(i);
  }
  while (!q.empty()) {
    int u = q.front(); q.pop();
    vis[ac[u].end] = ac[u].ans;
    int v = ac[u].fail;
    in[v]--;
    ac[v].ans += ac[u].ans; // 排序过程中顺便累加一下答案
    if (in[v] == 0) q.push(v);
  }
}
void query(std::string str) {
  int p = 0, l = str.size();
  for (int i = 0; i < l; i++) {
    int c = getNum(str[i]);
    p = ac[p].pos[c];
    ac[p].ans++;
  }
}

int main() {
  std::ios::sync_with_stdio(false); std::cin.tie(0);
  std::cin >> n;
  for (int i = 1; i <= n; i++) {
    std::string s;
    std::cin >> s;
    insert(s, i);
  }
  buildFail();
  std::string t;
  std::cin >> t;
  query(t);
  topo();
  for (int i = 1; i <= n; i++) {
    std::cout << vis[map[i]] << '\n';
  }
  return 0;
}
```

## 进一步理解

刚才我们提到过，所有的 fail 指针可以组成一棵树，那么所有能在树上进行的操作，都可以在 fail 树上进行，比如求 DFS 序、树上 DP、树上差分，甚至树链剖分。

看下面一道题。

[P2414 [NOI2011] 阿狸的打字机](https://www.luogu.com.cn/problem/P2414)

首先，这道题的三种操作，就像是构建一棵字典树 —— 输入小写字母就是加点，按 $\texttt{B}$ 就是回到父节点，按 $\texttt{P}$ 就是打一个结束标记。

其次让我们分析询问：查询第 $x$ 个打印的字符串在第 $y$ 个打印的字符串中出现的次数。可以发现，在 AC 自动机中，如果节点 $u$ 的 fail 指针指向节点 $v$，那么 $u$ 对应的字符串一定在 $v$ 对应的字符串中出现。那么，这个询问就变成了：有多少个属于 $v$ 的节点的 fail 指针 **直接或间接** 指向 $u$ 的结束位置，也就是，在 fail 树中，以 $u$ 为根的子树中，有多少个点属于 $y$。如果使用 DFN 序，那么就变成了树上序列统计问题，可以使用树状数组维护。

[我的 AC 代码](https://www.luogu.com.cn/record/245212441)

## 总结

AC 自动机是一种多模字符串匹配算法，基于字典树实现，通过 fail 指针处理失配情况，并使用路径压缩、拓扑排序等进一步优化。Fail 树可以通过树上问题的常用技巧进行处理。

## 更多习题

直接把风又引理的题单放在这里吧。

<https://next.tboj.cn/homework/69148da3a089cd109f0fa69f>