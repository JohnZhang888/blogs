## 更新日志

- 2026-03-06：修复一处笔误。
- 2026-03-13：添加了费马小定理。

---

> 此处仅记录做法，原理和证明请参阅 [OI Wiki 上的 **模逆元** 页面](https://oi-wiki.org/math/number-theory/inverse/)。

## 问题引入

如何求 $\dfrac{a}{b}$？小学数学告诉我们，$\dfrac{a}{b} = a \times \dfrac{1}{b}$。

那么若 $a, b, p \in \mathrm{\mathbf{Z}}$，如何求 $\dfrac{a}{b} \bmod \ p$，并且 $a$ 和 $b$ 都是八常大数？就像刚才我们把 $a$ 乘上 $b$ 的倒数一样，这里我们也需要用到 $b$ 的“倒数”，不过是 $\bmod \ p$ 意义上的倒数，我们称之为 **“乘法逆元”**。

## 定义与性质

如果有 $ax \equiv 1 \pmod p$，我们就称 $x$ 是 $a$ 在 $\bmod \ p$ 意义下的乘法逆元。

既然说乘法逆元是一种“倒数”，自然拥有以下性质：

记 $x$ 是 $b$ 在 $\bmod \ p$ 意义下的乘法逆元，则有

$$
\frac{a}{b} \bmod \ p = ax \bmod \ p = (a \bmod \ p) (x \bmod \ p)
$$

需要注意的是，只有当 $a$ 与 $p$ 互质时，才存在 $a$ 在 $\bmod \ p$ 意义下的乘法逆元。

## 求法

### 求单个数的逆元

#### 扩展欧几里得定理

在存在逆元的情况下，适用于所有模数。

```cpp
void exgcd(ll a, ll b, ll &x, ll &y) {
  if (!b) x = 1, y = 0, return;
  else exgcd(b, a % b, y, x), y -= a / b * x;
}
```

得到的 $x$ 就是 $a$ 在模 $b$ 意义下的乘法逆元。注意：我们求得的 $x$ 可能不是最小的解，为了使解最小，可以对 $b$ 取模。

#### 费马小定理

仅使用于模数是质数的情况。

设 $b$ 是 $a$ 在 $\bmod \ p$ 意义下的乘法逆元，则有：

$$
b = a^{p - 2} \bmod p.
$$

一般需要配合 **快速幂** 使用。

### 求从 $1$ 到 $n$ 每个数的逆元

```cpp
inv[1] = 1;
for (int i = 2; i <= n; i++) {
  inv[i] = (p - p / i) * inv[p % i] % p;
}
```

## 扩展应用：组合数取模

考虑组合数公式 $C_n^m = \dfrac{n!}{m!(n-m)!}$。$n! \bmod \ p$ 很好说，但是如何计算阶乘倒数取模？

有以下公式：

$$
\mathrm{invfac}(x) = \mathrm{invfac}(x-1) \times x ^ {p - 2}
$$

其中 $\mathrm{invfac}(x)$ 指 $x$ 的阶乘逆元。可以看出其中运用了费马小定理。

因此大数组合数取模代码如下：

```cpp
fact[0] = infact[0] = 1;
for (int i = 1; i <= x; i++) {
  fact[i] = fact[i-1] * i % MOD;
  infact[i] = infact[i-1] * quickPow(i, MOD-2) % MOD;
}
ll getC(int a, int b) {
  return fact[a] * infact[a-b] % MOD * infact[b] % MOD;
}
```
