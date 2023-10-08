---
date: 2023-10-08
title: EasyExcel-自定义"插件"
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
# EasyExcel-自定义"插件"

以下案例环境运行于 **2.2.7** 版本，从各大博客、论坛中收集

**依赖：**

```xml
        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>easyexcel</artifactId>
            <version>2.2.7</version>
        </dependency>
```

## 一个单元格多张图片

```java
public class CustomImageModifyHandler implements CellWriteHandler {
    private List<String> repeats = new ArrayList<>();
    // 单元格的图片最大张数（每列的单元格图片张数不确定，单元格宽度需按照张数最多的长度来设置）
    private Integer maxDataSize = 0;

	//...//
    @Override
    public void afterCellDataConverted(WriteSheetHolder writeSheetHolder, WriteTableHolder writeTableHolder, CellData cellData, Cell cell, Head head, Integer relativeRowIndex, Boolean isHead) {
        //  在 数据转换成功后 不是头就把类型设置成空
        if (isHead) {
            return;
        }
        //将要插入图片的单元格的type设置为空,下面再填充图片
        if (cellData.getImageValue() != null || cellData.getData() instanceof ArrayList) {
            cellData.setType(CellDataTypeEnum.EMPTY);
        }
    }

    @Override
    public void afterCellDispose(WriteSheetHolder writeSheetHolder, WriteTableHolder writeTableHolder, List<CellData> cellDataList, Cell cell, Head head, Integer relativeRowIndex, Boolean isHead) {
        //  在 单元格写入完毕后 ，自己填充图片
        if (isHead || CollectionUtil.isEmpty(cellDataList)) {
            return;
        }
        Boolean listFlag = false;
        ArrayList data = null;
        Sheet sheet = cell.getSheet();
        // 此处为ListUrlConverterUtil的返回值
        if (cellDataList.get(0).getData() instanceof ArrayList) {
            data = (ArrayList) cellDataList.get(0).getData();
            if (CollectionUtil.isEmpty(data)) {
                return;
            }
            if (data.get(0) instanceof CellData) {
                CellData cellData = (CellData) data.get(0);
                if (cellData.getImageValue() == null) {
                    return;
                } else {
                    listFlag = true;
                }
            }
        }
        if (!listFlag && cellDataList.get(0).getImageValue() == null) {
            return;
        }
        String key = cell.getRowIndex() + "_" + cell.getColumnIndex();
        if (repeats.contains(key)) {
            return;
        }
        repeats.add(key);
        if (data.size() > maxDataSize) {
            maxDataSize = data.size();
        }
        //60px的行高大约是900,60px列宽大概是248*8,根据需要调整
        sheet.getRow(cell.getRowIndex()).setHeight((short) 900);
        sheet.setColumnWidth(cell.getColumnIndex(), (int) (listFlag ? 21.8 * 256 * maxDataSize : 22.8 * 256));

        if (listFlag) {
            for (int i = 0; i < data.size(); i++) {
                CellData cellData = (CellData) data.get(i);
                if (cellData.getImageValue() == null) {
                    continue;
                }
                this.insertImage(sheet, cell, cellData.getImageValue(), i);
            }
        } else {
            // cellDataList 是list的原因是 填充的情况下 可能会多个写到一个单元格 但是如果普通写入 一定只有一个
            this.insertImage(sheet, cell, cellDataList.get(0).getImageValue(), 0);
        }

    }

    private void insertImage(Sheet sheet, Cell cell, byte[] pictureData, int i) {
        int picWidth = Units.pixelToEMU(175);
        int index = sheet.getWorkbook().addPicture(pictureData, HSSFWorkbook.PICTURE_TYPE_PNG);
        Drawing drawing = sheet.getDrawingPatriarch();
        if (drawing == null) {
            drawing = sheet.createDrawingPatriarch();
        }
        CreationHelper helper = sheet.getWorkbook().getCreationHelper();
        ClientAnchor anchor = helper.createClientAnchor();
        // 设置图片坐标
        anchor.setDx1(picWidth * i);
        anchor.setDx2(picWidth + picWidth * i);
        anchor.setDy1(0);
        anchor.setDy2(0);
        //设置图片位置
        anchor.setCol1(cell.getColumnIndex());
        anchor.setCol2(cell.getColumnIndex());
        anchor.setRow1(cell.getRowIndex());
        anchor.setRow2(cell.getRowIndex() + 1);
        // 设置图片可以随着单元格移动
        anchor.setAnchorType(ClientAnchor.AnchorType.MOVE_AND_RESIZE);
        drawing.createPicture(anchor, index);
    }
}
```

对比 **3.X** 版本中，图片导出：**https://easyexcel.opensource.alibaba.com/docs/current/quickstart/write#excel%E7%A4%BA%E4%BE%8B-6** 

**3.X** 版本的官方推荐多张图片方案，最大的问题就是图片的编排，需要自定义去控制单元格长度、各图片的位置等等。

虽然自己实现的方案，导出性能由于图片的处理、编排，会大幅的变弱；但是在数据量少于1000的导出环境中，还是可以无脑使用的。

总结：

**优点：** 自适应单元格宽高，图片自动横向编排，实现简单

**缺点：** 性能减弱，不适用于超过1000且多图片的文档

## 配套：多图片存储

```java
public class ImageUrlConverterUtil implements Converter<List<URL>> {
    @Override
    public Class<?> supportJavaTypeKey() {
        return List.class;
    }
 
    @Override
    public CellDataTypeEnum supportExcelTypeKey() {
        /**
         *这里记得枚举类型为IMAGE
         */
        return CellDataTypeEnum.IMAGE;
    }
 
    @Override
    public List convertToJavaData(CellData cellData, ExcelContentProperty contentProperty, GlobalConfiguration globalConfiguration) throws Exception {
        return null;
    }
 
    @Override
    public CellData<?> convertToExcelData(List<URL> value, ExcelContentProperty contentProperty, GlobalConfiguration globalConfiguration) throws Exception {
        // 这里进行对数据实体类URL集合处理
        List<CellData<?>> data = new ArrayList<>();
        // for 循环一次读取
        for (URL url : value) {
            try (InputStream inputStream = url.openStream()) {
                byte[] bytes = IoUtils.toByteArray(inputStream);
                data.add(new CellData<>(bytes));
            } catch (Exception e) {
                //图片异常展示的图片
            }
        }
 
        // 这种方式并不能返回一个List,所以只好通过CellData cellData = new CellData(data);将这个list对象塞到返回值CellData对象的data属性中；
        CellData<?> cellData = new CellData<>(data);
        cellData.setType(CellDataTypeEnum.IMAGE);
        return cellData;
    }
}
```

**使用案例：**

```java
    public static void export(HttpServletResponse response, String title, List<?> data,Class<?> exportO,int [] ar) throws IOException {
        response.setContentType("application/vnd.ms-excel;charset=utf-8");
        response.setHeader("Content-Disposition", "attachment;filename="
                + new String(title.getBytes(), StandardCharsets.UTF_8) + ".xls");
        response.setCharacterEncoding("UTF-8");
        EasyExcel.write(response.getOutputStream(), exportO)
                .registerWriteHandler(new CustomImageModifyHandler())
                .sheet("")
                .doWrite(data);
    }

public class DemoData{
    
    @ExcelProperty(value = "镭雕参考图", index = 5, converter = ImageUrlConverterUtil.class)
    private List<URL> images;
}
```

## 动态合并相同值单元格

在导出业务中，会有只在结果集出来后才知道需不需要合并的数据，比如学生成绩：

数据为：

```
1  小明  数学  100
2  小明  英语  90 
3  小明  语文  80
```



这时候更希望导出的数据更直观，组合成这样：

```
        数学  100
1  小明  英语  90 
        语文  80
```



因此需要定义一个可以根据所需去判断何时合并、如何合并的插件

```java
@Data
public class ExcelFillCellMergeStrategy implements CellWriteHandler {
    /**
     * 合并字段的下标，如第一到五列new int[]{0,1,2,3,4}
     */
    private int[] mergeColumnIndex;
    /**
     * 从第几行开始合并，如果表头占两行，这个数字就是2
     */
    private int mergeRowIndex;

    public ExcelFillCellMergeStrategy() {
    }

    public ExcelFillCellMergeStrategy(int mergeRowIndex, int[] mergeColumnIndex) {
        this.mergeRowIndex = mergeRowIndex;
        this.mergeColumnIndex = mergeColumnIndex;
    }
	//...//
    @Override
    public void afterCellDispose(WriteSheetHolder writeSheetHolder, WriteTableHolder writeTableHolder,
                                 List<CellData> list, Cell cell, Head head, Integer integer, Boolean aBoolean) {
        //当前行
        int curRowIndex = cell.getRowIndex();
        //当前列
        int curColIndex = cell.getColumnIndex();

        if (curRowIndex > mergeRowIndex) {
            for (int i = 0; i < mergeColumnIndex.length; i++) {
                if (curColIndex == mergeColumnIndex[i]) {
                    mergeWithPrevRow(writeSheetHolder, cell, curRowIndex, curColIndex);
                    break;
                }
            }
        }
    }

    private void mergeWithPrevRow(WriteSheetHolder writeSheetHolder, Cell cell, int curRowIndex, int curColIndex) {
        //获取当前行的当前列的数据和上一行的当前列列数据，通过上一行数据是否相同进行合并
        Object curData = cell.getCellTypeEnum() == CellType.STRING ? cell.getStringCellValue() :
                cell.getNumericCellValue();
        Cell preCell = cell.getSheet().getRow(curRowIndex - 1).getCell(curColIndex);
        Object preData = preCell.getCellTypeEnum() == CellType.STRING ? preCell.getStringCellValue() :
                preCell.getNumericCellValue();
        // 比较当前行的第一列的单元格与上一行是否相同，相同合并当前单元格与上一行
        if (curData.equals(preData)) {
            Sheet sheet = writeSheetHolder.getSheet();
            List<CellRangeAddress> mergeRegions = sheet.getMergedRegions();
            boolean isMerged = false;
            for (int i = 0; i < mergeRegions.size() && !isMerged; i++) {
                CellRangeAddress cellRangeAddr = mergeRegions.get(i);
                // 若上一个单元格已经被合并，则先移出原有的合并单元，再重新添加合并单元
                if (cellRangeAddr.isInRange(curRowIndex - 1, curColIndex)) {
                    sheet.removeMergedRegion(i);
                    cellRangeAddr.setLastRow(curRowIndex);
                    sheet.addMergedRegion(cellRangeAddr);
                    isMerged = true;
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
}
```

上述是看了其他人的合并方案，在已知文档需要合并多少列，且适用与上面值与下面值相同就合并的文档。

不过并不适用与

```
        数学  100
1  小明  英语  90 
        语文  80
```

英文一旦出现

```java
        数学  100
1  小明  英语  90 
        语文  80
2  小红  语文  80
```

语文与80的单元格就会被合并，所以为了扩展，可以进行如下改造，在 **mergeWithPrevRow** 方法中：

```java
    private void mergeWithPrevRow(WriteSheetHolder writeSheetHolder, Cell cell, int curRowIndex, int curColIndex,int sameIndex) {
        //获取当前行的当前列的数据和上一行的当前列列数据，通过上一行数据是否相同进行合并
		//...//
        
        Object preHeadRow = cell.getRow().getCell(sameIndex).getCellTypeEnum() == CellType.STRING? 
                cell.getRow().getCell(0).getStringCellValue():cell.getRow().getCell(0).getNumericCellValue();
        Object nextHeadRow = preCell.getRow().getCell(sameIndex).getCellTypeEnum() == CellType.STRING?
                preCell.getRow().getCell(sameIndex).getStringCellValue():preCell.getRow().getCell(sameIndex).getNumericCellValue();
        //比较列是否相同已合并
        if (!preHeadRow.equals(nextHeadRow)) {
            return;
        }
        
        // 比较当前行的第一列的单元格与上一行是否相同，相同合并当前单元格与上一行
       	//...//
    }
```

添加 **sameIndex** 去控制判断前列的某一行是否属于业务标识已合并状态，如果不是就不纳入合并的逻辑中。

再加拓展，还可以将这段判断，抽成一个函数接口入参，由使用者自己添加过滤逻辑