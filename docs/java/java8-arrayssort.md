---
date: 2022-05-30
title: Java8-Arrays.sort
category:
  - Java
tag:
  - Java
head:
  - - meta
    - name: keywords
      content: JVM,JDK,JRE,Java
  - - meta
    - name: description
      content: Arrays.sort是我们常用来排序数组的方法，不止如此，其实Collections.sort方法中也是直接拿...
---
# Java8-Arrays.sort
Arrays.sort是我们常用来排序数组的方法，不止如此，其实Collections.sort方法中也是直接拿到集合中的元素数组作为入参直接调用Arrays.sort方法的。

所以作为JDK中的常驻API，底层中对排序的各个场景是做了对应的优化算法的，使Arrays.sort在默认使用的前置下，有着最高的性能功率。
## Sort

由于Java泛型、多数据类型的原因，sort方法在Arrays类中有多重重载场景。

下面我们以两部分，基本类型数组、对象类型数组，进行源码跟踪。

### 对象类型数组

```
    public static void sort(Object[] a) {
        if (LegacyMergeSort.userRequested)
            legacyMergeSort(a);
        else
            ComparableTimSort.sort(a, 0, a.length, null, 0, 0);
    }
```

在JDK8版本的源码中，有着两个分支的算法路径，这也是基于版本迭代，解决历史遗留问题的一个方案。

由于在JDK6之前，对象数组的默认排序方式是直接采取legacyMergeSort算法 = 插入排序+分治思想+归并的思路对数组内元素进行排序的，当元素没有具体值时，则会根据数组中的假定的比较器Comparable.compareTo进行元素的比较排序。

**legacyMergeSort算法**

内部采取的是**mergeSort**并归思路，当数组元素小于7时，会采取插入排序的方式将原数组排序。

当数组元素大于7时，则会通过分治+归并算法，将mergeSort方法进行迭代。

虽然说legacyMergeSort看起来，符合一个快速优化型的排序思路，但是在一般场景上，大于7的元素直接采取归并排序，由于归并会细分多个小排序，且每个小排序都是一次迭代过程。

这也就导致了该算法模式的部分不成熟。

所以在7版本中，对其排序场景进行的更加严格的分析设计 **ComparableTimSort**

**ComparableTimSort算法**

基本的排序思路和legacyMergeSort无差，都采取了分治+归并的排序思想。

当待排序的数组的长度小于32时，直接采取Binary Sort，使用二分查找找到已排序数组，在找到对应的插入顺序进行排序。

当元素长度大于32时，采用TimSort排序过程:

在countRunAndMakeAscending方法中，获取当前排序数组可支持的最小区域的排序小数组长度，简单的说就是假设数组长度为2^n返回16，假设长度不为2的次幂，则不断右移运算，直到计算出16到32之间的数。

根据最小长度以及排序长度的偏移量，进行不断Binary Sort过程：

![image-20220531020302342.png](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2022-05-31/image-20220531020302342.png)

### 基本类型数组

对于基本数组类型的排序，由于没有比较器的干涉，在JDK设计中是直接根据数组的长度找到最坏情况以及最优情况，平衡性最好的一种算法。

**DualPivotQuicksort**

1. 当数组长度小于47时，采用直接插入排序算法。
![image-20220531020546250.png](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2022-05-31/image-20220531020546250.png)

2. 当数组长度大于等于47，小于286时，采用快速排序。
![image-20220531020956652.png](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2022-05-31/image-20220531020956652.png)

   ```
                   /*
                    * Every element from adjoining part plays the role
                    * of sentinel, therefore this allows us to avoid the
                    * left range check on each iteration. Moreover, we use
                    * the more optimized algorithm, so called pair insertion
                    * sort, which is faster (in the context of Quicksort)
                    * than traditional implementation of insertion sort.
                    */
   *相邻部分的每个元素都起作用
   *因此，这允许我们避免
   *每次迭代时进行左范围检查。此外，我们使用
   *更优化的算法，即所谓的对插入
   *排序，速度更快（在快速排序环境下）
   *与传统的插入排序实现相比。
   ```

   比起一般的快速排序，JDK的排序中，采取的双轴快排的思路，即将原排序数组分成 1-2-3，三片区域。

   在1-2 和2-3中，分别设置不同的轴坐标，然后进行一般的快速排序的迭代思路。

   虽说在比较次数上来说，双轴排序一定比一般排序的比较次数多，但是由于双迭代的思路，在CPU运用上可以大幅度的提高运算率，所以在一般机器上来说。

   普通的快排迭代思路，可能只会用到10%这样的CPU率，但是使用双轴双迭代思路，则可以提升至50%这样的效率。

3. 在大于等于286长度时，当有序段数大于等于67时，还是使用双轴快排，当有序数段小于67时，则会采取归并排序的思路，将原数组进行进一步小区域的数组排序。

除此之外，DualPivotQuicksort还提供单独的排序API可供使用，比如计数排序，Timesort等。具体的可以查找资料，或者看源码调用，我这里可以提供找到的比较完善的博客：[DualPivotQuicksort源码解读](https://blog.csdn.net/lyj1597374034/article/details/106720629)
