*本文原作于 2025 年 10 月 24 日，关于 Tarjan 算法的部分补充于 2025 年 11 月 4 日。*

> 最珍贵的，不是各自独行的高远，而是回望来路，找到那个共享的起点，让分叉的轨迹重新交汇。—— 题记

昨天看到岁岁似今朝以“学不成名誓不还”的勇气学 LCA，并感叹“LCA 是我最严厉的母亲”，心血来潮，也学了一下。翻看洛谷玲琅满目的题解，竟学会了~~三~~**四**种方法（最后一种于 2025 年 11 月 4 日补充），在此总结并进行比较，希望对大家和自己有所帮助。

## 倍增求 LCA

大家可能知道使用“暴力跳跃”来求 LCA 的方法：我们循环找深度较深的点的父节点，直到两个节点深度相同，然后一起向上跳。倍增法基本也是这个思路，只是通过倍增优化掉了逐步向上跳的过程。

我们设 $f_{u, j}$ 为节点 $u$ 以上的第 $2^j$ 个节点。显然 $f_{i, 0}$ 表示节点 $i$ 的父节点，可以通过 DFS 求得所有 $f_{u, 0}$。想要求解每一个 $i$ 节点跳 $2^j$ 到的节点，等同于 $i$ 节点先往上跳 $2^{j-1}$ 步到的节点，再往上跳 $2^{j-1}$ 步到的最终节点。因此可以得到状态转移方程：

$$
f_{i, j} = f_{f_{i, j-1}, j-1}
$$

求解 LCA 时，需要找到两个点上面同一深度的点，如果两个节点相同，则返回两者之间任一节点，否则一起向上跳相同步数直至求出 LCA 为止。

模板题（[洛谷 P3379](https://www.luogu.com.cn/problem/P3379)）参考代码：

```cpp
#include <bits/stdc++.h>
typedef long long ll;
const int N = 1e6+10;
int f[N][30], dep[N], n, m, s;
std::vector<int> g[N];

void dfs(int u, int par) {
  f[u][0] = par;
  dep[u] = dep[par] + 1;
  for (auto &v: g[u]) {
    if (v != par) dfs(v, u);
  }
}

void init() {
  for (int j = 1; (1 << j) <= n; j++) {
    for (int i = 1; i <= n; i++) {
      f[i][j] = f[f[i][j-1]][j-1];
    }
  }
}

int lca(int u, int v) {
  if (dep[u] < dep[v]) std::swap(u, v);
  for (int i = 22; i >= 0; i--) {
    if (dep[f[u][i]] >= dep[v]) u = f[u][i];
  }
  if (u == v) return u;
  for (int i = 22; i >= 0; i--) {
    if (f[u][i] != f[v][i]) {
      u = f[u][i];
      v = f[v][i];
    }
  }
  return f[u][0];
}

int main() {
  std::ios::sync_with_stdio(false); std::cin.tie(0);
  std::cin >> n >> m >> s;
  for (int i = 1; i <= n-1; i++) {
    int a, b;
    std::cin >> a >> b;
    g[a].push_back(b);
    g[b].push_back(a);
  }
  dfs(s, 0);
  init();
  for (int i = 1; i <= m; i++) {
    int a, b;
    std::cin >> a >> b;
    std::cout << lca(a, b) << '\n';
  }
  return 0;
}
```

## DFS 序求 LCA

DFS 序是指对一棵树进行深度优先搜索得到的序列。DFN 是指树上每个节点在 DFS 序中出现的位置。

设树上两个节点 $u$、$v$ 的 LCA 为 $d$，且 $u \neq v$。不妨设 $\mathrm{dfn}(u) < \mathrm{dfn}(v)$，显然 $v$ 不是 $u$ 的祖先。分类讨论：

1.   $u$
  
  不是
  $v$
  
  的祖先。
  
  那么容易证明，DFS 序在
  $u$
  
  和
  $v$
  
  之间的节点均为
  $d$
  
  的后代。因此，我们可以找到满足
  $\mathrm{dfn}(u) < v' < \mathrm{dfn}(v)$
  
  且深度最小的节点
  $v'$
  
  ，那么
  $v'$
  
  的父节点就是
  $d$
  
  。
2.   $u$
  
  是
  $v$
  
  的祖先。
  
  如果还按照刚才的方法来求，可能会求得
  $u$
  
  的祖先，这不是我们想要的结果。但是如果把查询区间变成
  $[\mathrm{dfn}(u)+1, \mathrm{dfn}(v)]$
  
  ，就可以求得正确的
  $d$
  
  了。对于情况 1，由于
  $u \neq v'$
  
  ，所以还可以查询
  $[\mathrm{dfn}(u)+1, \mathrm{dfn}(v)]$
  
  。

需要特判的是，如果 $u = v$，直接返回 $u$ 即可。

至于如何查找深度最小的节点 $v$，显然要用 ST 表了。为了查询方便，我们可以向 $f_{i, 0}$ 中存入每个节点的父亲，比较时取时间戳较小的节点。

模板题（[洛谷 P3379](https://www.luogu.com.cn/problem/P3379)）参考代码：

```cpp
#include <bits/stdc++.h>
typedef long long ll;
const int N = 5e5+10;
int n, m, s;
std::vector<int> g[N];
int st[N][20], lg[N], dfn[N], dn;
int get(int x, int y) {
  return dfn[x] < dfn[y]? x: y;
}
void dfs(int u, int par) {
  dn++;
  dfn[u] = dn;
  st[dn][0] = par;
  for (int &v: g[u]) {
    if (v != par) {
      dfs(v, u);
    }
  }
}
int lca(int u, int v) {
  if (u == v) return u;
  u = dfn[u], v = dfn[v];
  if (u > v) std::swap(u, v);
  u++; 
  int d = lg[v - u];
  return get(st[u][d], st[v - (1 << d) + 1][d]);
}

int main() {
  std::ios::sync_with_stdio(false); std::cin.tie(0);
  std::cin >> n >> m >> s;
  for (int i = 1; i <= n-1; i++) {
    int a, b;
    std::cin >> a >> b;
    g[a].push_back(b);
    g[b].push_back(a);
  }
  dfs(s, 0);
  lg[1] = 0;
  for (int i = 2; i <= n; i++) {
    lg[i] = lg[i >> 1] + 1;
  }
  for (int j = 1; j <= lg[n]; j++) {
    for (int i = 1; i + (1 << j) - 1 <= n; i++) {
      st[i][j] = get(st[i][j-1], st[i + (1 << (j - 1))][j-1]);
    }
  }
  for (int i = 1; i <= m; i++) {
    int u, v;
    std::cin >> u >> v;
    std::cout << lca(u, v) << '\n';
  }
  return 0;
}
```

## 树剖求 LCA

想学这个方法，首先得会树剖。强烈推荐看一下 [JZ8 的博客](https://next.tboj.cn/blog/687/68d93133d93d9f357f2a5d82)，他和我简直心有灵犀啊 ~~（JZ8 是谁？我不知道，我是永康喵喵）~~ 。

首先先进行预处理，把重链剖分出来。然后不停地把当前两个节点中深度较深的那一个跳到其所属的重链的顶端，直到两个节点处于一条链上，此时深度较浅的节点就是 LCA。

配合上面的那篇博客，代码显然，不再赘述 ~~（我绝对不会说是因为我太懒了没写）~~ 。

## Tarjan 算法

在学本算法前，请先确保自己会**并查集**。

Tarjan 算法是一种借助并查集**离线**求解 LCA 的算法。这种算法的一般流程是：对树进行 DFS，在回溯时对当前节点及其父节点在并查集中进行合并。如果当前位于节点 $u$ 时，节点 $v$ 已被访问，且要查询节点 $v$ 和节点 $u$ 的 LCA 时，就返回 $\mathrm{find}(u)$。

流程非常简单好记，但是有几个坑点需要注意：

1. **不要进行按秩合并**，始终将并查集中子节点的 `par` 设置为父节点。
2. 为了快速查询并处理询问，可以用一个存有 `pair` 的 `vector` 数组来存储询问。记第 $i$ 个询问为查询 $u$ 和 $v$ 的 LCA，则 `queries[u].push_back({v, i}), queries[v].push_back({u, i});`。

```cpp
#include <bits/stdc++.h>
typedef long long ll;
const int N = 5e5+10;
int ans[N], n, m, s;
bool vis[N];
std::vector<int> g[N];
std::vector<std::pair<int, int> > queries[N];

struct UF {
  int par[N], siz[N];
  void init() {
    for (int i = 1; i <= n; i++) {
      par[i] = i, siz[i] = 1;
    }
  }
  int find(int u) {
    return u == par[u] ? u : (par[u] = find(par[u]));
  }
  void merge(int u, int v) {
    u = find(u), v = find(v);
    par[u] = v;
  }
} uf;

void tarjan(int u) {
  vis[u] = true;
  for (auto &v: g[u]) {
    if (vis[v]) continue;
    tarjan(v);
    uf.merge(v, u);
  }
  for (auto &q : queries[u]) {
    int v = q.first;
    int id = q.second;
    if (vis[v]) ans[id] = uf.find(v);
  }
}

int main() {
  std::ios::sync_with_stdio(false); std::cin.tie(0);
  std::cin >> n >> m >> s;
  for (int i = 1; i <= n - 1; i++) {
    int u, v;
    std::cin >> u >> v;
    g[u].push_back(v);
    g[v].push_back(u);
  }
  uf.init();
  for (int i = 1; i <= m; i++) {
    int u, v;
    std::cin >> u >> v;
    if (u == v) ans[i] = u;
    else {
      queries[u].push_back({v, i});
      queries[v].push_back({u, i});
    }
  }
  tarjan(s);
  for (int i = 1; i <= m; i++) {
    std::cout << ans[i] << '\n';
  }
  return 0;
}
```

## 比较

下表部分由 DeepSeek 生成。

| 特性 | DFS 序 + RMQ | 倍增法 | 树链剖分 | Tarjan |
| --- | --- | --- | --- | --- |
| 预处理时间复杂度 | $O(n \log n)$ | $O(n \log n)$ | $O(n)$ | / |
| 单次查询时间复杂度 | $O(1)$ | $O(\log n)$ | $O(\log n)$ | / |
| 整个程序时间复杂度 | $O(n \log n + m)$ | $O(nm \log n)$ | $O(nm \log n)$ | $O(n + m \alpha(n))$ |
| 空间复杂度 | $O(n \log n)$ | $O(n \log n)$ | $O(n)$ | $O(n)$ |
| 查询常数因子 | 很小 | 中等 | 很小 | 很小 |
| 编码复杂度 | 高 | 中等 | 高 | 中等 |
| 灵活性 | 差 | 好 | 极好 | 差 |
| 是否支持动态树 | 否 | 否 | 否 | 否 |
| 扩展性 | 差 | 较好 | 极好 | 差 |
| 是否必须离线 | 否 | 否 | 否 | 是 |

注：$\alpha(x)$ 为**反阿克曼函数**，增长率极慢，一般可当作常数看待。

总而言之，建议初学者先学习倍增法，因为其代码实现简单、灵活性较好。如果要追求更高的性能，推荐使用树剖法、DFS 序法或 Tarjan 算法（尤其在需要处理大量查询时）。
