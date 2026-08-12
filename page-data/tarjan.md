> 最真实的连接，不是浮于表面的相遇，而是深入图景，发现那些循环往复却坚不可摧的共同体。—— 题记

请注意：本文讨论的是在图上求解连通性相关问题的 Tarjan 算法，不是求解最近公共祖先的 LCA 算法。Tarjan 发明了多种算法和数据结构，很多算法都以他命名，不要弄混了。

在阅读本文之前，请务必确保自己了解：

- 图、有向图、无向图
- 拓扑排序
- 动态规划

## 概念

为了理解本文，需要了解一些前置概念：

- **强连通** 是指有向图中的两个节点能够互相抵达。
- **强连通图** 是指一个任意两个节点都具有强连通性的有向图。
- **强连通分量** 是指有向图中极大的强连通子图。
- **桥（割边）** 是指满足其被删去后，可以使连通无向图或强连通有向图变为不连通图的一条边。

## 问题引入

考虑以下一个问题：

> 给你一幅有向图（**不保证不存在环**），上面每个节点都有一个权值。你需要找出一条路径，使路径经过的点权值之和最大。只需要输出这个权值和。允许多次经过一条边或者一个点，但是，重复经过的点，权值只计算一次。

如果保证这幅图没有环，将会非常好做：直接对图进行拓扑排序，然后 DP 即可。然而对于这幅有环图，不能进行拓扑排序，也就不能保证 DP 的无后效性。

再仔细思考一下：既然图上有环，那么环上的每个节点都可以互相抵达 —— 甚至不仅是环，图上每个 **强连通分量** 之间的节点都能互相抵达。那么，我们可不可以把每个强连通分量都视作一个点，其权值为其包含的所有点的权值之和？

当然可以！这种做法就叫做“**缩点**”。

朴素的做法是对图中每个顶点 $v$，从 $v$ 出发做一次 DFS/BFS，再从 $v$ 出发在反向图上做一次 DFS/BFS，两次经过的顶点的交集就是包含 $v$ 的强连通分量。此算法的最坏时间复杂度可能退化到惊人的 $O(n^3)$。

不过还好，我们有一种经典的求强连通分量的算法：**Tarjan 算法**。

## 算法介绍

Tarjan 算法对图进行 DFS，在搜索过程中，维护一个栈，每次将第一次经过的节点加入栈中。此外我们还需要为每个节点 $u$ 维护以下变量：

1. $\operatorname{dfn}(u)$：DFS 遍历时节点 $u$ 被搜索的次序。
2. $\operatorname{low}(u)$：在 $u$ 的子树中能够回溯到的最早的已经在栈中的节点。

在搜索过程中，对于节点 $u$ 和与其相邻的非父节点 $v$，考虑三种情况：

1.   $v$
  
  未被访问，继续对
  $v$
  
  进行 DFS。在搜索过程中，用
  $\operatorname{low}(v)$
  
  更新
  $\operatorname{low}(u)$
  
  ，即
  $\operatorname{low}(u) = \min(\operatorname{low}(u), \operatorname{low}(v))$
  
  。因为存在从
  $u$
  
  到
  $v$
  
  的直接路径，所以
  $v$
  
  能够回溯到的已经在栈中的结点，
  $u$
  
  也一定能够回溯到。
2.   $v$
  
  被访问过，且已在栈中：根据
  $\operatorname{low}$
  
  值的定义，用
  $\operatorname{dfn}(v)$
  
  更新
  $\operatorname{low}(u)$
  
  ，即
  $\operatorname{low}(u) = \min(\operatorname{low}(u), \operatorname{dfn}(v))$
  
  。
3.   $v$
  
  被访问过，已不在栈中：说明
  $v$
  
  已搜索完毕，其所在连通分量已被处理，所以不用对其做操作。

对于一个连通分量，其中有且仅有一个 $u$ 使得 $\operatorname{dfn}(u) = \operatorname{low}(u)$。因此，在回溯的过程中，判定 $\operatorname{dfn}(u) = \operatorname{low}(u)$ 是否成立，如果成立，则栈中 $u$ 及其上方的节点构成一个强连通分量。不要忘了将这些构成强连通分量的节点弹出栈。

然后，我们把每个强连通分量当成一个点，重新建图，在新图上进行拓扑排序和 DP 即可。

如果你理解了以上内容，恭喜你，已经可以完成 [洛谷 P3387 缩点](https://www.luogu.com.cn/problem/P3387) 了。

关于 Tarjan 算法的正确性证明，我可能讲不太明白，可以阅读 [这篇文章](https://zhuanlan.zhihu.com/p/629370905)。

```cpp
#include <bits/stdc++.h>
typedef long long ll;
const int N = 1e4+10, M = 1e5+10;
std::vector<int> g[N], g2[N];
int n, m;
int dfn[N], low[N], cnt = 0, inStk[N], belong[N];
int u[M], v[M];
std::stack<int> stk;
int in[N], dp[N], ans, a[N];

void tarjan(int u) {
  dfn[u] = low[u] = ++cnt;
  stk.push(u);
  inStk[u] = 1;
  for (auto &v : g[u]) {
    if (!dfn[v]) {
      tarjan(v);
      low[u] = std::min(low[u], low[v]);
    } else if (inStk[v]) {
      low[u] = std::min(low[u], dfn[v]);
    }
  }
  if (dfn[u] == low[u]) {
    int t;
    do {
      t = stk.top();
      stk.pop();
      inStk[t] = 0;
      belong[t] = u;
      if (t != u) a[u] += a[t];
    } while (t != u);
  }
}
void topo() {
  std::queue<int> q;
  for (int i = 1; i <= n; i++) {
    if (i == belong[i] && !in[i]) {
      q.push(i);
      dp[i] = a[i];
    }
  }
  while (!q.empty()) {
    int u = q.front();
    q.pop();
    for (auto &v : g2[u]) {
      dp[v] = std::max(dp[v], dp[u] + a[v]);
      if (--in[v] == 0) q.push(v);
    }
  }
}

int main() {
  std::ios::sync_with_stdio(false); std::cin.tie(0);
  std::cin >> n >> m;
  for (int i = 1; i <= n; i++) {
    std::cin >> a[i];
  }
  for (int i = 1; i <= m; i++) {
    int a, b;
    std::cin >> a >> b;
    g[a].push_back(b);
    u[i] = a, v[i] = b;
  }
  for (int i = 1; i <= n; i++) {
    if (!dfn[i]) tarjan(i);
  }
  for (int i = 1; i <= m; i++) {
    int x = belong[u[i]], y = belong[v[i]];
    if (x != y) {
      g2[x].push_back(y);
      in[y]++;
    }
  }
  topo();
  for (int i = 1; i <= n; i++) {
    ans = std::max(ans, dp[i]);
  }
  std::cout << ans << '\n';
  return 0;
}
```

## 拓展延伸

### 无向图中找桥

根据以上对无向图中桥的定义，即一旦去掉桥，则图将不连通，分析可得，这条边的子孙若不经过父亲，就不能访问到更小的时间戳。因此一旦满足 $\operatorname{low}(v) > \operatorname{dfn}(u)$，就说明我们找到了桥。只需要修改刚才 Tarjan 函数的判断条件即可。

```cpp
void tarjan(int u, int pre) {
  dfn[u] = low[u] = ++cnt;
  for (auto &v : g[u]) {
    if (v == pre) continue;
    if (!dfn[v]) {
      tarjan(v, u);
      low[u] = std::min(low[u], low[v]);
    } else {
      low[u] = std::min(low[u], dfn[v]);      
    }
    if (low[v] > dfn[u]) bridges.push_back({std::min(u, v), std::max(u, v)});
  }
}
```

相关习题：[洛谷 P1656 炸铁路](https://www.luogu.com.cn/problem/P1656) ~~张作霖快乐题~~

### 无向图中找割点

与桥的定义类似，在无向图中，若删去一个点，则此图不连通，则称此点为 **割点**。

其代码实现与找桥极为类似，只需将 `if (low[v] > dfn[u])` 改为 `if (low[v] >= dfn[u])`，并修改答案的结算方式即可。

相关习题：[洛谷 P3388【模板】割点（割顶）](https://www.luogu.com.cn/problem/P3388)

### 求无向图中双连通分量

**双连通分量** 指无向图中的一个极大子图，其中任意两个节点至少有两条不重复的路径相连，其最大的性质就是其中不存在桥。找出无向图中双连通分量的过程，本质上就是对无向图进行缩点，其流程与有向图缩点基本相同，只要保证 DFS 的过程中不回到祖先即可。

```cpp
void tarjan(int u, int pre) {
  stk.push(u);
  dfn[u] = low[u] = ++cnt;
  for (auto &v : g[u]) {
    if (v == pre) continue;
    if (!dfn[v]) tarjan(v, u);
    low[u] = std::min(low[u], low[v]);
  }
  if (dfn[u] == low[u]) {
    compCnt++;
    belong[u] = compCnt;
    while (stk.top() != u) {
      belong[stk.top()] = compCnt;
      stk.pop();
    }
    stk.pop();
  }
}
```

相关习题：[洛谷 P2860 [USACO06JAN] Redundant Paths G](https://www.luogu.com.cn/problem/P2860)

## 总结

Tarjan 算法可以快速求解图中的强连通分量或桥，并进行缩点。

什么时候适合用 Tarjan 算法呢？

- 在可能有环的图上进行 DP，如求路径权值最大值等
- 求解连通性相关问题，如找出有多少个强连通分量、找桥（拆除一条边使得图不连通）、找双连通分量等

## 更多习题

- [洛谷 P1262 间谍网络](https://www.luogu.com.cn/problem/P1262)
- [CF1000E We Need More Bosses](https://codeforces.com/problemset/problem/1000/E)
- [洛谷 P2341 [USACO03FALL / HAOI2006] 受欢迎的牛 G](https://www.luogu.com.cn/problem/P2341)
