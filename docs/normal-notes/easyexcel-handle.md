---
date: 2025-02-01
title: EasyExcel,图片合并自动居中与内容部分变色
category: 笔记
tag:
  - 笔记
head:
  - - meta
    - name: keywords
      content: Java,EasyExcel,乐云一
  - - meta
    - name: description
      content: EasyExcel,图片合并自动居中与内容部分变色
---
# EasyExcel,图片合并自动居中与内容部分变色

很不喜欢做导出的需求，普通的表格报表没有任何问题；可一旦产品发现了Excel新的使用姿势，那我们的开发难度几乎是指数级的上升。

所以每次遇到与平时不同的导出需求，在实现之后一定得把思路源码记录。因为导出需求千万，格式大同小异，比如本篇记录的图片自动居中于内容部分变色；

## 单元格(合并)后图片自动居中

单个图片居中很简单，不少框架会将其变为一个小小的注解功能。一旦将这张图片放到合并后的单元格中，就只能由开发者自行计算了；

合并单元格的过程不过描述，总之被动态合并之后的单元格只有两种摸样：

- 列合并
- 行合并

而我们做到一张图片自动居中式的插入到单元格中，考虑到居中、等比缩放因素的影响，是需要获取合并之后单元格的总高和总宽的。

所以单元格尽量不要太随意（指A单元格宽20px高10px，B单元格宽30px高10px；但是下一行待合并的单元格的高和上一行不相同）。不过也可以通过遍历合并单元集`List<CellRangeAddress> mergeRegions = sheet.getMergedRegions()` 累加出最终单元格的高和宽。

下述将以**宽恒定（400px），一个单元格高恒定（52px）并且仅做上下合并为例**，设计一个图片居中的`CellWriteHandler`

### 单元格宽（400px）高（70px）

```java
public class FixedHeightAutoCellHandler implements CellWriteHandler {

    private final int rowHeightPx = 70;

    @SneakyThrows
    @Override
    public void afterCellDispose(WriteSheetHolder writeSheetHolder, WriteTableHolder writeTableHolder, List<WriteCellData<?>> cellDataList, Cell cell, Head head, Integer relativeRowIndex, Boolean isHead) {

        //1、从网络上根据url获取图片及信息
        String imageUrl = ExportUtils.getCellValue(cell).toString();
        HttpURLConnection connection = (HttpURLConnection) new URL(imageUrl).openConnection();
        InputStream inputStream = connection.getInputStream();
        byte[] bytes = IoUtil.readBytes(inputStream);
        BufferedImage read = ImageIO.read(IoUtil.toStream(bytes));

        //2、拿到合并单元格的起始和终止位置，并且计算出合并单元格的总高cellHeight
        int cellHeight = Math.round(cell.getRow().getHeightInPoints() * 1.33F);
        int firstRow = cell.getRowIndex();
        int lastRow = cell.getRowIndex() + 1;
        int firstColumn = cell.getColumnIndex();
        int lastColumn = cell.getColumnIndex();
        CellRangeAddress mergedRegion = getMergedRegion(cell);
        if (mergedRegion != null) {
            firstRow = mergedRegion.getFirstRow();
            lastRow = mergedRegion.getLastRow();
            firstColumn = mergedRegion.getFirstColumn();
            lastColumn = mergedRegion.getLastColumn();
            cellHeight = (lastRow - firstRow + 1) * cellHeight;
        }
        
        //将图片数据加载到内存中
        int pictureIdx = writeSheetHolder.getSheet().getWorkbook().addPicture(bytes, Workbook.PICTURE_TYPE_PNG);
        //固定宽
        int cellWidth = 406;
        //图片的实际高和宽
        int imageWidth = read.getWidth();
        int imageHeight = read.getHeight();
        // 计算宽度和高度的缩放比例
        int factImageWidth;
        int factImageHeight;
        //判断合并之后的单元格是宽和高哪个大， 优先选择小的进行等比缩放
        if (cellWidth >= cellHeight) {
            //以单元高为主
            factImageWidth = (cellHeight * imageWidth) / imageHeight;
            factImageHeight = cellHeight;
        } else {
            //以单元宽为主
            factImageWidth = cellWidth;
            //图片等比缩放之后的目标高
            int tarHeight = (cellWidth * imageHeight) / imageWidth;
            //如果目标高<单元格总高  可行
            if (tarHeight <= cellHeight) {
                factImageHeight = tarHeight;
            } else {
                //如果目标高>单元格总高 进行单元格宽的缩放
                factImageWidth = (cellHeight * imageWidth) / imageHeight;
                factImageHeight = cellHeight;
            }
        }
        float xgap = cellWidth - factImageWidth;
        int dx1 = (int) ((xgap) / 2 * Units.EMU_PER_PIXEL); // 左边距离
        int dx2 = (int) ((xgap) / 2 + factImageWidth) * Units.EMU_PER_PIXEL; // 右边距离

        //需要多少个单元格
        int howRow = (factImageHeight / rowHeightPx) + (factImageHeight % rowHeightPx != 0 ? 1 : 0);
        // 计算图片在合并单元格中的起始行和结束行，实现上下居中显示
        // 合并单元格总行数
        int totalRows = lastRow - firstRow + 1;
        if (howRow > totalRows) {
            howRow = totalRows;
        }
        // 剩余行数
        int remainingRows = totalRows - howRow;
        // 计算起始行 
        firstRow = firstRow + remainingRows / 2;
        lastRow = firstRow + howRow - 1;
        if (cellHeight != factImageHeight) {
            cellHeight = howRow * rowHeightPx;
        }

        int dy1 = (cellHeight - factImageHeight) * Units.EMU_PER_PIXEL; // 上边距离

        ClientAnchor anchor = new XSSFClientAnchor(dx1, dy1, dx2, 0, firstColumn, firstRow, lastColumn, lastRow + 1);
        anchor.setAnchorType(ClientAnchor.AnchorType.DONT_MOVE_AND_RESIZE);

        //插入图片
        Drawing<?> drawing = writeSheetHolder.getSheet().createDrawingPatriarch();
        drawing.createPicture(anchor, pictureIdx);
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
    
}

```

**Tip：** 上面代码是成体使用版，除了代码上的注释讲解外，另插入提示

- 如果没有固定单元格的高/宽，该如何进行上述的计算与判断

  答：核心的判断逻辑不会变，变的只是如何获取实际单元格高宽的过程；和前文一样，遍历循环...

- `Math.round(cell.getRow().getHeightInPoints() * 1.33F）` 这行计算是什么意思

  答：因为poi中cell拿到的列单元为pt，通过换算需要*1.33 ，才能接近px

- 计算居中的过程是什么样的

  答：再拿到了图片等比缩放后的高度，以及合并单元格的总高和总宽后，通过控制`dx1偏移左多少`、`dx2偏移右多少`、`dy1偏移上多少`，以及控制图片在合并单元格中实际的头和尾位置，实现居中的设置。

- ...

## 内容部分变色

```java
public class coloChangeExcelHandler implements CellWriteHandler {

    @Override
    public void afterCellDispose(CellWriteHandlerContext context) {
        Cell cell = context.getCell();

        Workbook workbook = cell.getSheet().getWorkbook();
        String label = cell.getStringCellValue();
        ///左边
        int left = 0;
        //右边
        int right = 1;
        // 创建富文本字符串对象
        RichTextString richTextString = new XSSFRichTextString(label);
        // 对找到的"绿色"字符串应用绿色字体样式
        Font greenFont = workbook.createFont();
        greenFont.setFontName("思源黑体 CN Regular");
        greenFont.setColor(IndexedColors.GREEN.getIndex());
        richTextString.applyFont(left, right, greenFont);
        cell.setCellValue(richTextString);
    }
}

```

**TIP**：变色的话很简单，只需要创建一个父文本，然后设置文件对象的属性值和其下标位置即可，但是里面还是有一些门道提醒的

- `greenFont.setFontName("思源黑体 CN Regular")` 设置一个Excel默认不支持的字体也会生效，但是默认显示的效果是宋体，电脑有思源黑体字体库则显示他
- 命中文本，什么情况下变色等等逻辑属于业务范畴，自行判断定义
- 富文本可频繁创建和定义
- ...

