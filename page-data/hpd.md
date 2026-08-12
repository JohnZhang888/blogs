*本文写于 2025 年 9 月 28 日。*

> 2026-08-01 更新：修复了一处严重的笔误。

> 最深刻的，不是盲目攀爬每根枝桠，而是将错综复杂的路径编织成链，让每一步都通往根源。—— 题记

## 前言

这几天一下课，班里的某位同学就走到我座位旁边，念叨着“来学树剖”。在他的 ~~传销~~ ~~诈骗~~ ~~怂恿~~ 鼓励之下，我也终于来到了这座大山面前，但发现似乎也并不难……

## 何为重链剖分

考虑你有一棵树，对于树上的每个节点，在它的所有儿子中，我们称后代数量多的儿子为**重儿子**，而称所有重儿子以外的儿子为**轻儿子**。我们称连接任意两个重儿子的边叫做**重边**，而其他边统称**轻边**。接下来就是重点：相邻重边连起来的，连接数个重儿子的链叫做**重链**。所谓**重链剖分**，就是将一棵树分成几条重链的过程。

## 重链剖分有何用

简而言之：重链剖分能帮助我们把要处理的数据从一个**二维的树形结构**转化为几个**一维的线性结构**，同时将树上的一些连续的顶点合并为一个部分，降低处理难度。此外，由于我们剖分的总是重链，也能一定程度上起到**启发式**的作用，降低时间复杂度。

如果你仍感到一知半解，那让我们看一道经典例题。

## 例题：[P3384 【模板】重链剖分/树链剖分 - 洛谷](https://www.luogu.com.cn/problem/P3384)

很明显地，这道题很容易能想到一个暴力解法：以操作 2 为例，我们可以先找到 $x$ 与 $y$ 的最近公共祖先，然后从 $x$ **一步步**地访问到那个祖先，把沿途遇到的权值加进答案里，然后再从祖先那里**一步步地**访问 $y$，并累加沿途的权值。

为什么我要把这个“一步步”加粗呢？因为这里就是导致我们 TLE 的罪魁祸首，也是我们进行优化的出发点。

不知道大家有没有因此联想到**线段树**，那也是把累加**一个个**数优化的过程。然而，显而易见地，线段树是在一个**一维线性结构**中进行的。想起来我们刚才提到的重链剖分的功能了吗？于是，我们就要用重链剖分，**以列代树**，并通过线段树解决这个问题。

由此衍生出一个疑问：线段树处理的是连续的区间，你怎么保证从 $x$ 到 $y$ 的路径上经过的点是连续的呢？

这其实是无法保证的，因为我们事先不知道要处理哪些 $x$ 和 $y$ 啊。不过，我们倒是可以把这一路径分成尽可能**少且长**的**连续**区间。针对“连续”二字，我们可以想到 DFS 序，它使得树上连续的一段的编号也是连续的；而“少且长”三字，自然就对应“重链剖分”中的“重”字了。

回到操作 2，我们可以把这一区间修改操作分成几个步骤：

1. 设所在链顶端深度更深的那个点为 $x$ 点。
2. 将 $\mathrm{ans}$ 加上 $x$ 点到 $x$ 所在重链顶端这一段区间的点权和。由于我们采用了 DFS 序，因此这些点的编号也是连续的，很容易通过线段树处理。
3. 把 $x$ 跳到 $x$ 所在链顶端的那个点的上面一个点。
4. 重复执行第 2 步和第 3 步，直到两个点处于一条链上，这时再加上此时两个点的区间和。

可以看到，我们通过重链剖分，巧妙地将路径划分为了几条节点编号连续的重链，并将它们所得到的答案累加。以下是操作 2 的参考代码：

```cpp
inline int queryPath(int x, int y) {
  int ans = 0;
  while (topOf[x] != topOf[y] && x != y) {
    if(deepOf[topOf[x]] < deepOf[topOf[y]]) {
      std::swap(x, y);
    }
    ans += tree.query(idOf[topOf[x]], idOf[x], 1, n, 1);
    ans %= MOD;
    x = parOf[topOf[x]];
  }
  if (deepOf[x] > deepOf[y]) {
    std::swap(x, y);
  }
  ans += tree.query(idOf[x], idOf[y], 1, n, 1);
  return ans % MOD;
}
```

对于剩余几个操作，方法也是类似的。

### 本题参考 AC 代码

```cpp
#include <bits/stdc++.h>
typedef long long ll;
#define endl '\n'
const int N = 1e5+10;
std::vector<int> g[N];
int n, m, r, MOD, val[N], newVal[N];
int parOf[N], deepOf[N], sizeOf[N], maxSonOf[N], idOf[N], cnt, topOf[N];

/* 线段树 */
struct Segtree{
  struct Node{
    ll val, tag;
  } tr[4*N];
  void build(int s, int t, int p) {
    if(s == t) {
      tr[p].val = newVal[s];
      return;
    }
    int mid = (s + t) >> 1;
    build(s, mid, p*2);
    build(mid+1, t, p*2+1);
    tr[p].val = tr[p*2].val + tr[p*2+1].val;
  }
  void pushDown(int s, int t, int p) {
    int mid = (s + t) >> 1;
    if(tr[p].tag) {
      tr[p*2].val += tr[p].tag * (mid - s + 1);
      tr[p*2+1].val += tr[p].tag * (t - mid);
      tr[p*2].tag += tr[p].tag;
      tr[p*2+1].tag += tr[p].tag;
      tr[p].tag = 0;
    }
  }
  int query(int l, int r, int s, int t, int p) {  
    if(l <= s && t <= r) {
      return tr[p].val;
    }
    int mid = (s + t) >> 1, sum = 0;
    pushDown(s, t, p);
    if(l <= mid) {
      sum += query(l, r, s, mid, p*2) % MOD;
    }
    if(r > mid) {
      sum += query(l, r, mid+1, t, p*2+1) % MOD;
    }
    return sum % MOD;
  }
  void update(int l, int r, int c, int s, int t, int p) {
    if(l <= s && t <= r) {
      tr[p].val += ((t - s + 1) * c) % MOD;
      tr[p].tag += c % MOD;
      tr[p].val %= MOD;
      tr[p].tag %= MOD;
      return;
    }
    int mid = (s + t) >> 1;
    pushDown(s, t, p);
    if (l <= mid) {
      update(l, r, c, s, mid, p*2);
    }
    if(r > mid) {
      update(l, r, c, mid+1, t, p*2+1);
    }
    tr[p].val = (tr[p*2].val + tr[p*2+1].val) % MOD;
  }  
} tree;

/* 第一遍 DFS：获取各个节点的深度、父节点、子树大小和重儿子 */
void dfs1(int curr, int par, int deep) {
  deepOf[curr] = deep;
  parOf[curr] = par;
  sizeOf[curr] = 1;
  int maxSon = 0;
  for (int i = 0; i < g[curr].size(); i++) {
    int v = g[curr][i];
    if(v == par) continue;
    dfs1(v, curr, deep+1);
    sizeOf[curr] += sizeOf[v];
    if(sizeOf[v] > maxSon) {
      maxSonOf[curr] = v;
      maxSon = sizeOf[v];
    }
  }
}

/* 第二遍 DFS：找出 DFS 序并进行重链剖分，即找出每个节点对应的重链起点 */
void dfs2(int curr, int top) {
  idOf[curr] = ++cnt;
  newVal[cnt] = val[curr];
  topOf[curr] = top;
  if(!maxSonOf[curr]) return;
  dfs2(maxSonOf[curr], top);
  for(int i = 0; i < g[curr].size(); i++) {
    int v = g[curr][i];
    if(v == parOf[curr] || v == maxSonOf[curr]) continue;
    dfs2(v, v); // 建立新链
  }
}

/* 操作 2：查询路径点权和 */
inline int queryPath(int x, int y) {
  int ans = 0;
  while (topOf[x] != topOf[y] && x != y) {
    if(deepOf[topOf[x]] < deepOf[topOf[y]]) {
      std::swap(x, y);
    }
    ans += tree.query(idOf[topOf[x]], idOf[x], 1, n, 1);
    ans %= MOD;
    x = parOf[topOf[x]];
  }
  if (deepOf[x] > deepOf[y]) {
    std::swap(x, y);
  }
  ans += tree.query(idOf[x], idOf[y], 1, n, 1);
  return ans % MOD;
}

/* 操作 4：查询子树点权和 */
inline int querySon(int x) {
  return tree.query(idOf[x], idOf[x] + sizeOf[x] - 1, 1, n, 1);
}

/* 操作 1：修改路径点权 */
inline void updatePath(int x, int y, int k) {
  k %= MOD;
  while (topOf[x] != topOf[y] && x != y) {
    if (deepOf[topOf[x]] < deepOf[topOf[y]]) {
      std::swap(x, y);
    }
    tree.update(idOf[topOf[x]], idOf[x], k, 1, n, 1);
    x = parOf[topOf[x]];
  }
  if(deepOf[x] > deepOf[y]) {
    std::swap(x, y);
  }
  tree.update(idOf[x], idOf[y], k, 1, n, 1);
}

/* 操作 3：修改子树点权 */
inline void updateSon(int x, int k) {
  tree.update(idOf[x], idOf[x] + sizeOf[x] - 1, k, 1, n, 1);
}

signed main() {
  std::ios::sync_with_stdio(false), std::cin.tie(0), std::cout.tie(0);
  std::cin >> n >> m >> r >> MOD;
  for(int i = 1; i <= n; i++) {
    std::cin >> val[i];
    val[i] %= MOD;
  }
  for(int i = 1; i <= n-1; i++) {
    int x, y;
    std::cin >> x >> y;
    g[x].push_back(y);
    g[y].push_back(x);
  }
  dfs1(r, 0, 1);
  dfs2(r, r);
  tree.build(1, n, 1);
  for (int i = 1; i <= m; i++) {
    int op, x, y, z;
    std::cin >> op;
    if (op == 1) {
      std::cin >> x >> y >> z;
      updatePath(x, y, z);
    } else if (op == 2) {
      std::cin >> x >> y;
      std::cout << queryPath(x, y) << endl;
    } else if(op == 3) {
      std::cin >> x >> z;
      updateSon(x, z);
    } else {
      std::cin >> x;
      std::cout << querySon(x) << endl;
    }
  }
  return 0;
}
```

## 结语

不知道这里该说些什么了，总之，重链剖分是个很有用的算法，希望大家都能掌握吧。
