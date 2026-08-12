*本文写于 2025 年 9 月 18 日。*

## 前言

昨天在正睿的“~~IOI~~ 普及联赛”中，有这样[一道题](https://zhengruioi.com/problem/2059)，极大地冲击了本蒟蒻的心灵。赛后查看题解，此题竟然涉及计算几何，这更是本蒟蒻从未涉足的领域。我遂查询资料，学习了 CCW 算法以及用其判断线段是否相交的方法，并迅速写了一个骗得 25 分的代码。借此机会，我想分享一下 CCW 算法及利用其判断两线段是否相交的方法。

## CCW 算法

CCW 是 **Counter-Clockwise** 的缩写，即**逆时针方向**。顾名思义，此算法用来计算两首尾相接的向量的转向关系。

CCW 的本质是**向量叉积**。给定两个向量，$\vec{AB}$ 和 $\vec{AC}$，它们的向量叉积公式为 $cross = \vec{AB} \times \vec{AC} = (B_x - A_x) (C_y - A_y) - (B_y - A_y) (C_x - A_x)$，这个 $cross$ 就是判断转向的依据：

- 当 $cross < 0$ 时，从点 $A$ 到点 $B$ 再到点 $C$，路径呈**逆时针**方向旋转。
- 当 $cross = 0$ 时，$A, B, C$ 三点**共线**。
- 当 $cross < 0$ 时，从点 $A$ 到点 $B$ 再到点 $C$，路径呈**顺时针**方向旋转。

**C++ 代码实现参考：**

```cpp
struct Point {
    double x, y;
};

double ccw(Point a, Point b, Point c) {
    return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}
```

## 判断两线段是否相交

众所周知，对于两条线段 $AB$ 和 $CD$，如果 $A$ 和 $B$ 分别在 $CD$ 的两侧，且 如果 $C$ 和 $D$ 分别在 $AB$ 的两侧，则 $AB$ 与 $CD$ 相交。前者需满足 $\mathrm{ccw}(A, B, C) \times \mathrm{ccw}(A, B, D) < 0$，即从向量 $\vec{AB}$ 转向点 $C$ 与点 $D$ 的方向相反；类似地，后者需满足 $\mathrm{ccw}(C, D, A) \times \mathrm{ccw}(C, D, B) < 0$。

**C++ 代码实现参考**（需结合以上 `ccw` 的函数定义）：

```cpp
if (ccw(a, b, c) * ccw(a, b, d) < 0 && ccw(c, d, a) * ccw(c, d, b) < 0) {
    // 两条线段相交
}
```

## [相关题目](https://zhengruioi.com/problem/2059)参考题解

> 题目大意：给出 $N$ 个点，两两连接这些点组成一个线段集合 $S$，求 $S$ 中不与其它任何线段相交的线段数量。

> **注意：以下题解是暴力做法，只能在原题中获得 25 分，AC 做法请参考官方题解。**

```cpp
#include <iostream>
#include <vector>
using namespace std;
#define int long long
#define endl '\n'
const int N = 1e3 + 10;
struct Point {
	int x, y;
} p[N];
struct Side {
	Point a, b;
};
vector<Side> s;
int n, ans;
int ccw(Point a, Point b, Point c) {
	return a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y);
}

signed main() {
	ios::sync_with_stdio(false);
	cin.tie(0);
	cout.tie(0);
	cin >> n;
	for (int i = 1; i <= n; i++) {
		int x, y;
		cin >> x >> y;
		p[i] = {x, y};
	}
	for (int i = 1; i <= n - 1; i++) {
		for (int j = i + 1; j <= n; j++) {
			s.push_back({p[i], p[j]});
		}
	}
	for (int i = 0; i < s.size(); i++) {
		int suc = true;
		for (int j = 0; j < s.size(); j++) {
			Point a = s[i].a, b = s[i].b, c = s[j].a, d = s[j].b;
			if (ccw(a, b, c) * ccw(a, b, d) < 0 && ccw(c, d, a) * ccw(c, d, b) < 0) {
				suc = false;
				break;
			}
		}
		if (suc) {
			ans++;
		}
	}
	cout << ans << endl;
	return 0;
}
```

## 小结

CCW 算法只是计算几何庞大世界的沧海一粟，这一广阔的算法天地仍有很多地方值得我们探索。例如，若要在上文提到的题目中获得满分，必须要学习包括**凸包**在内的更高级的计算几何算法。路漫漫其修远兮，希望大家以十足的兴趣，自主探索计算几何的奇妙世界。
