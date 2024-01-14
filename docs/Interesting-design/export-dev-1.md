---
date: 2024-01-13
title: EasyExcel导出复杂表格
category: 设计
tag:
  - 设计
head:
  - - meta
    - name: keywords
      content: Java,EasyExcel,乐云一
  - - meta
    - name: description
      content: EasyExcel-自定义"插件"
---
# EasyExcel导出复杂表格

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-01-14/790550af-a97e-40cf-84e6-ad995f60ac29.png)

## 背景

最近有了个订单导出的需求，不同于一般的表格式列表导出，整理出来的内容分支如下：

1. 同一个序号产品下，根据内容[包含图片、文字信息]动态合并
2. 在动态合并中交插图片嵌入单元格
3. 同一列存在文字或图片的情况
4. 除可填写单元格外，其余单元格为锁定状态
5. 图片根据合并后的单元格等比缩放
6. 两个不同表头的表

很简单吧，起初我也以为，调调方法，写写注解就能完成的东西，没想到处处都是坑，因此针对上述的表格模板，起一篇思路；

导出的插件使用的是`EasyExcel`

```xml
        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>easyexcel</artifactId>
            <version>3.1.1</version>
        </dependency>
```

版本3.X.X，2.X.X也可以，无非是注解上多一些功能定义可以简化操作。

## 开发

### 多表头

多表头很简单，见EasyExcel的文档：

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-01-12/dc1c76b0-5714-4d6e-99ea-9c04433f0dc3.png)*

https://easyexcel.opensource.alibaba.com/docs/2.x/quickstart/write#excel%E7%A4%BA%E4%BE%8B-11

只需要将两张表的原始数据各自组装好，设置好对应的WriteTable对象即可；

比方说开头的表格，上面的表为订单表的表头，下面表为订单表的表身；

### 锁定单元格

锁定单元格，因为需要有指定只需要指定一些单元格不锁定，其余都锁定，不能直接使用EasyExcel的样式`@ContentStyle(locked = true)`

必须通过重写`CellWriteHandler` 接口增强表格渲染的动作，锁定表格的设置则基于`poi` 的单元格设置；

首先是第一步，对整个表格添加保护，并且必须设置一个密码：**密码为空字符串时，不需要输入密码打开文件**

```java
		WriteSheet writeSheet = EasyExcel.writerSheet()
                .needHead(Boolean.FALSE).build();
        Sheet sheet = excelWriter.writeContext().writeSheetHolder().getSheet();
        sheet.protectSheet("");
```

需要注意，当表格设置 `protectSheet` 时，默认是所有单元格都被保护锁定；

接着是如何指定列进行锁定与不锁定的判断，这里很简单只需重写 `CellWriteHandler` 在 `afterCellDispose` 方法中写入对列的判断

比如:

```java
    private Set<String> noLockMap = new HashSet<>();

    @Override
    public void afterCellDispose(CellWriteHandlerContext context) {
        WriteCellStyle writeCellStyle = context.getFirstCellData().getOrCreateStyle();
        if (noLockMap.contains(context.getRowIndex() + "#" + context.getColumnIndex()) || noLockMap.contains("-1"+"#"+context.getColumnIndex())) {
            writeCellStyle.setLocked(false);
        } else {
            writeCellStyle.setLocked(true);
        }
    }

    /**
     * 下标一对一组装
     *
     * @param rows   行
     * @param column 列
     */
    public ExcelLockCellHandler(int[] rows, int[] column) {
        if (rows.length == column.length) {
            for (int i = 0; i < rows.length; i++) {
                noLockMap.add(rows[i] + "#" + column[i]);
            }
        }
    }
```

传参为 `[1, 1, -1], [0, 1, 1]` 时 . 1_0 1_1列不锁定，并且 -1_1 时column=2所有列不锁定

这里需要注意有一个大坑，在 [https://github.com/alibaba/easyexcel/issues](https://github.com/alibaba/easyexcel/issues) 中搜索锁定单元格相关的信息，会指向一个方法

 ```java
    CellStyle cellStyle = cell.getCellStyle();
    cellStyle.setLocked(true);
 ```

但是在3.1.1版本中，这样设置样式会失效，只能使用  `WriteCellStyle` 类

### 图片与文字

图片与文字有两种办法，一种是简单的可以直接使用 3.X.X版本后提供的 `WriteCellData` 类，设置单元格属性值：

```java
    WriteCellData<Void> writeCellData = new WriteCellData<>();
    writeCellData.setType(CellDataTypeEnum.STRING);
    writeCellData.setStringValue("额外的放一些文字");
```

```java
  	WriteCellData<Void> writeCellData = new WriteCellData<>();
    // 可以放入多个图片
    List<ImageData> imageDataList = new ArrayList<>();
    ImageData imageData = new ImageData();
    imageDataList.add(imageData);
    writeCellData.setImageDataList(imageDataList);
    // 放入2进制图片
    imageData.setImage(FileUtils.readFileToByteArray(new File(imagePath)));
    // 图片类型
    imageData.setImageType(ImageType.PICTURE_TYPE_PNG);
```

第二种，则是业务逻辑型，采用 字符串 `images:imageUrl`  为前缀图片地址拼加的方式，区分普通文本与图片地址；

这样做的好处是 `WriteCellData` 类采用的是EasyExcel内置的插件处理，因此无法改变图片的大小，只能进行类似CSS中magin的偏移设置；

并且因为各个单元格的图片样式都存在差异，单元格高宽、居中...等等，因此使用字符串前缀区分的方式还可以为各个单元格的图片样式装配对应的策略。

同样的也是需要用到实现 `CellWriteHandler` 接口

```javascript
    @Override
    public void afterCellDispose(WriteSheetHolder writeSheetHolder, WriteTableHolder writeTableHolder, List<WriteCellData<?>> cellDataList, Cell cell, Head head, Integer relativeRowIndex, Boolean isHead) {
		//.......
        this.implantImage(cell);
    }

  /**
     * 嵌入单元格图片
     */
    private void implantImage(Cell cell) {
        float cellHeight = cell.getRow().getHeightInPoints();
        try {
            String implantInfo = cell.getStringCellValue();
          	/**
          	* 拿到对应图片模式样式策略
          		比如下方images1:
          	**/
            if (implantInfo.startsWith("images1:")) {
                String imageUrl = implantInfo.replace("images1:", "");
                Workbook workbook = cell.getSheet().getWorkbook();
                CreationHelper helper = workbook.getCreationHelper();
                Drawing<?> drawing = cell.getSheet().createDrawingPatriarch();
                ClientAnchor anchor = helper.createClientAnchor();
                byte[] bytes = HttpUtil.createGet(imageUrl).execute().bodyBytes();
                int pictureIdx = workbook.addPicture(bytes, Workbook.PICTURE_TYPE_PNG);
                Picture picture = drawing.createPicture(anchor, pictureIdx);
                anchor.setCol1(cell.getColumnIndex());
                anchor.setCol2(cell.getColumnIndex() + 1);
                anchor.setRow1(cell.getRowIndex());
                anchor.setRow2(cell.getRowIndex() + 1);
                picture.getAnchor().setDy1(0);
                picture.getAnchor().setDy2(0);
                picture.getAnchor().setDx1(0);
                picture.getAnchor().setDx2(0);
                anchor.setAnchorType(ClientAnchor.AnchorType.MOVE_AND_RESIZE);
                picture.resize();
            }
        } catch (Exception e) {
        }
    }
```

### 动态合并与图片

最后剩下的就是整个需求中最难调试的地方：

1. 动态合并
2. 动态合并后的单元格，图片居中展示

动态合并属于强业务关联了，在开头的示例图中可以分析：

- 头列序号相同的合并
- 同一序号表中，同类的 "镭雕信息" 合并
- 从指定行开始合并，只需要对指定列进行合并

除此之后还可以根据对Excel的使用习惯加上：

- 头列序号相同时，第n列写入时如果n-1列值为空，则合并
- 头列序号相同时，第n列写入时如果n-1列值与该值相同，则合并
- 头列序号与指定列相同时，第n列与第n-1列参与上述判断
- ....

文字描述下不是很清楚，以图示的序号二为例

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-01-14/dfc13541-7d69-4220-b600-8afca2988897.png)

从左到右下标0-11；

从Excel的第四行开始合并，只需要合并，1，2，3，4，5，6，7，8，9 列

可以出现以下进行合并判断的组合：

[1, 2，3, 4, 5, 6, 7, 8] 根据 头列序号[0] ，相同时合并

[9] 根据 [0,8] ，相同时合并；

在加上

- 头列序号相同时，第n列写入时如果n-1列值为空，则合并
- 头列序号相同时，第n列写....

的逻辑，就可以写出单元格什么时候进行合并的代码；

至于如何合并，也可以很简单的围绕poi 的 `sheet.getMergedRegions()` ：

最后还可以将 `什么时候进行合并` 的逻辑抽象为函数功能，配合 `CellWriteHandler` 接口，代码如下：

```java
public class ExcelMergeCellHandler implements CellWriteHandler {
	
    /**
     * 合并字段的下标
     */
    private int[] mergeColumnIndex;
    /**
     * 从第几行开始合并
     */
    private int mergeRowIndex;
    
        /**
     * 合并前的前序条件判断
     */
    private final Map<Integer, List<Function<Cell, Boolean>>> mergerHeadFunctions = new HashMap<>();

    /**
    *	preMergerFunctions 什么时候合并的组合
    **/
    public ExcelImplantMergeCellHandler(int mergeRowIndex, int[] mergeColumnIndex, Map<List<Integer>, List<Integer>> preMergerFunctions) {
        this.mergeRowIndex = mergeRowIndex;
        this.mergeColumnIndex = mergeColumnIndex;
        Set<Map.Entry<List<Integer>, List<Integer>>> entries = preMergerFunctions.entrySet();
        for (Map.Entry<List<Integer>, List<Integer>> entry : entries) {
            //第几列字段
            List<Integer> key = entry.getKey();
            //针对第几列区分合并
            List<Integer> value = entry.getValue();
            key.forEach(index -> {
                List<Function<Cell, Boolean>> functions = new ArrayList<>();
                if (mergerHeadFunctions.containsKey(index)) {
                    functions = mergerHeadFunctions.get(index);
                }
                functions.add((cell) -> {
                    Cell preCell = cell.getSheet().getRow(cell.getRowIndex() - 1).getCell(cell.getColumnIndex());
                    AtomicBoolean result = new AtomicBoolean(true);
                    for (Integer headIndex : value) {
                        Cell currentHead = cell.getRow().getCell(headIndex);
                        Cell preHead = preCell.getRow().getCell(headIndex);
                        result.set(this.getCellValue(currentHead).equals(this.getCellValue(preHead)));
                        if (!result.get()) break;
                    }
                    return result.get();
                });
                mergerHeadFunctions.put(index, functions);
            });
        }
    }
    
    private void mergeWithPrevRow(WriteSheetHolder writeSheetHolder, Cell cell, int curRowIndex, int curColIndex) {
        //获取当前行的当前列的数据和上一行的当前列列数据，通过上一行数据是否相同进行合并
        Cell preCell = cell.getSheet().getRow(curRowIndex - 1).getCell(curColIndex);

        Object preValue = this.getCellValue(preCell);
        Object currentValue = this.getCellValue(cell);
        //比较头列是否相同已 合并
        if (CollectionUtil.isNotEmpty(mergerHeadFunctions) && mergerHeadFunctions.containsKey(curColIndex)) {
            List<Function<Cell, Boolean>> biFunctions = mergerHeadFunctions.get(curColIndex);
            for (Function<Cell, Boolean> biFunction : biFunctions) {
                Boolean apply = biFunction.apply(cell);
                if (!apply) return;
            }
        }
        // 比较当前行的第一列的单元格与上一行是否相同，相同合并当前单元格与上一行
        if (preValue == null || preValue.equals(currentValue) || StringUtils.isBlank(preValue.toString())) {
            Sheet sheet = writeSheetHolder.getSheet();
            List<CellRangeAddress> mergeRegions = sheet.getMergedRegions();
            boolean isMerged = false;
            for (int i = 0; i < mergeRegions.size(); i++) {
                CellRangeAddress cellRangeAddr = mergeRegions.get(i);
                // 若上一个单元格已经被合并，则先移出原有的合并单元，再重新添加合并单元
                if (cellRangeAddr.isInRange(curRowIndex - 1, curColIndex)) {
                    sheet.removeMergedRegion(i);
                    cellRangeAddr.setLastRow(curRowIndex);
                    sheet.addMergedRegion(cellRangeAddr);
                    isMerged = true;
                    break;
                }
            }
            // 若上一个单元格未被合并，则新增合并单元
            if (!isMerged) {
                CellRangeAddress cellRangeAddress = new CellRangeAddress(curRowIndex - 1, curRowIndex, curColIndex,
                        curColIndex);
                sheet.addMergedRegion(cellRangeAddress);
            }
        }
    }

    private Object getCellValue(Cell cell) {
        if (cell == null) {
            return null;
        }
        switch (cell.getCellType()) {
            case NUMERIC:
                return cell.getNumericCellValue();
            case STRING:
                return cell.getStringCellValue();
            case BOOLEAN:
                return cell.getBooleanCellValue();
            case FORMULA:
                return cell.getCellFormula();
            default:
                return null;
        }
    }
}
```

其中	入参为：

```java
        Map<List<Integer>, List<Integer>> maps = new HashMap<>();
        maps.put(CollectionUtil.newArrayList(1, 3, 4, 5, 6, 7, 8), CollectionUtil.newArrayList(0));
        maps.put(CollectionUtil.newArrayList(9), CollectionUtil.newArrayList(8));

		(new int[]{0, 1, 2, 3, 4, 5, 6, 7, 8, 9}, 3, maps)
```

时完美满足图示的合并需求，代码很长，但稍稍看看就可以发现并不复杂，以上代码可以直接使用；

**最后来到了坑最多的，将图片放置在合并后的表格中，并且等比缩放，垂直居中**

处理在业务逻辑型的插入图片中，核心处理为等比缩放与垂直居中：

#### 等比缩放

将图片完美插入单元格中，有两种办法：

1. Excel自带的嵌入单元格功能
2. 自己算

可惜的是，代码的导出无法调用到Excel的嵌入单元格函数，只能选择自己算。

算之前一定要确认，已知的不变值，比方说图片表格中的图片单元格的宽恒为 `176px`

`如果单元格的宽没有限制，那么只需要拿到整个表格中图片最宽的那一个为最大值整体设置即可；`

一般可以拿到的不变值一定是：图片高、图片宽、单元格宽

那么可以得到等比缩放公式：

<img src="https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-01-14/c969cd96-e540-48a9-8847-a6a65d43b41b.png" alt="https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-01-14/c969cd96-e540-48a9-8847-a6a65d43b41b.png" style="zoom:33%;" />



很简单的可以算出将图片缩放至单元格中时图片高，坑也如期到来。

单元格 `Cell` 拿到的宽与高的值单位，与 `picture.getImageDimension()` 拿到的值单位，和设置图片的picture.resize(x,y); 单位不一致

- cell拿到的宽的值单位，为1/256字符
- cell拿到的高的值单位，为pt
- 图片拿到的高与宽，为px
- 图片设置值为,0-1,并且比例很诡异，为1时并不会填满

因此需要进行对应值的单位转换，以全部变为px为例，代码:

```java
    public int convertPointsToPixels(float points) {
        float pixelsPerInch = 96;  // 标准的像素每英寸数值
        float pointsPerInch = 72;  // 标准的磅每英寸数值

        float pixels = points * (pixelsPerInch / pointsPerInch);
        return Math.round(pixels);
    }

    private int convertColumnWidthToPixels(int columnWidth) {
        final int DEFAULT_CHAR_WIDTH = 256; // 默认字符宽度，每个字符占 256 个单位
        final int DEFAULT_PIXEL_WIDTH = 8; // 默认像素宽度，每个单位占 8 个像素

        return (columnWidth / DEFAULT_CHAR_WIDTH) * DEFAULT_PIXEL_WIDTH;
    }
```

单位处理完成，到了核心点，"合并之后的单元格"，这里非常需要注意，从 `cell.getRow().getHeightInPoints()` 拿到的单元格只是当前小格，因此

```
                    anchor.setCol1(cell.getColumnIndex());
                    anchor.setCol2(cell.getColumnIndex() + 1);
                    anchor.setRow1(cell.getRowIndex());
                    anchor.setRow2(cell.getRowIndex() + 1);
```

的设置只会将图片放置到最后一个单元格中；

需要拿到当前单元格合并之后的总单元格，可以这样：

```java
    private void implantImage(Cell cell) {
        String implantInfo = cell.getStringCellValue();

        CellRangeAddress mergedRegion = getMergedRegion(cell);
        if (mergedRegion != null) {
            int firstRow = mergedRegion.getFirstRow();
            int lastRow = mergedRegion.getLastRow();
            int firstColumn = mergedRegion.getFirstColumn();
            int lastColumn = mergedRegion.getLastColumn();

            anchor.setCol1(firstColumn);
            anchor.setCol2(lastColumn + 1);
            anchor.setRow1((firstRow);
            anchor.setRow2(lastRow + 1);
            int mergedRegionHeight = 0;
            for (int row = firstRow; row <= lastRow; row++) {
                Row sheetRow = cell.getSheet().getRow(row);
                if (sheetRow != null) {
                    for (int column = firstColumn; column <= lastColumn; column++) {
                        Cell mergedCell = sheetRow.getCell(column);
                        if (mergedCell != null) {
                            mergedRegionHeight += mergedCell.getRow().getHeightInPoints();
                        }
                    }
                }
            }
            /**
             * 合并后的总高
             */
            cellHeight = mergedRegionHeight;
        } else {
            anchor.setCol1(cell.getColumnIndex());
            anchor.setCol2(cell.getColumnIndex() + 1);
            anchor.setRow1(cell.getRowIndex());
            anchor.setRow2(cell.getRowIndex() + 1);
        }
    }           
    private CellRangeAddress getMergedRegion(Cell cell) {
        Sheet sheet = cell.getSheet();
        for (CellRangeAddress region : sheet.getMergedRegions()) {
            if (region.isInRange(cell.getRowIndex(), cell.getColumnIndex())) {
                return region;
            }
        }
        return null;
    }
```

最后可以加入公式：

```java
		// 拿到总高
		//----------------
        // 1/256 字节
        float columnWidthInPixels = convertColumnWidthToPixels(cell.getSheet().getColumnWidth(cell.getColumnIndex()));
        //PX
        int imageWidth = picture.getImageDimension().width;
        int imageHeight = picture.getImageDimension().height;
        // 计算宽度和高度的缩放比例
        float cellImageHeight = (columnWidthInPixels*imageHeight) /imageWidth;
        float adjustedHeight = cellImageHeight / ((cellHeight/20)*96);
        picture.getAnchor().setDy1(0);
        picture.getAnchor().setDy2(0);
        picture.getAnchor().setDx1(0);
        picture.getAnchor().setDx2(1);

        anchor.setAnchorType(ClientAnchor.AnchorType.MOVE_AND_RESIZE);
        picture.resize(1.0, adjustedHeight);
```

####  垂直居中 

至于最后的垂直居中，最开始想着也是计算高度Height+图片高的偏移；

但是在合并单元格中，我们其实只需要将图片的起始位置设置在合并单元格的最中间的格子上即可；

所以只需将

```java
            anchor.setCol1(firstColumn);
            anchor.setCol2(lastColumn + 1);
            anchor.setRow1((firstRow);
            anchor.setRow2(lastRow + 1);
```

修改为

```java
            anchor.setCol1(firstColumn);
            anchor.setCol2(lastColumn + 1);
            anchor.setRow1(((firstRow+lastRow)/2)-1);
            anchor.setRow2(lastRow + 1);
```

### 样式

最后就只剩下表格的字体颜色、背景颜色、文本居中等等设置了，这些只需要看官方api+网上信息即可。

只强调一个地方，最后的 "镭雕信息" 看起来像是一个表头，对应三列，其实只是将表格样式边框去掉了：

三个属性的都使用

```
@ExcelProperty(value = "镭雕信息", index = ?)
@HeadStyle(fillPatternType = FillPatternTypeEnum.SOLID_FOREGROUND)
```

index = 9 /=10 /=11