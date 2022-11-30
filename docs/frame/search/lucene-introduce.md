---
date: 2021-09-10
title: Lucene，全文检索工具
category: 
  - Lucene
tag:
  - Lucene
head:
  - - meta
    - name: keywords
      content: Java,Lucene,全文检索,搜索引擎
---

# Lucene

> 引用
> 元老级别的全文检索~~框架~~，准确的说应该是一个工具包。
> 自2000年发布到至今，由于其开源且免费，所以各方面功能都非常非常的成熟，当有一点很不友好。
> 因为是老外发明，所以对母语是中文的我们很不友好，不友好！，

[非中文文档](https://lucene.apache.org/core/7_7_3/index.html)
## 作者
![QQ截图20210910164546.png](https://leyuna-blog-img.oss-cn-hangzhou.aliyuncs.com/image/2021-09-10/QQ截图20210910164546.png)width="auto" height="auto"作者：Doug Cutting,老大哥镇图。
## 能做什么
Lucene的本质就是搜索，使用空间换时间的观念，将需要搜索查询的数据建立一份Lucene规定的索引文档。然后Lucene根据倒排序的方式，根据搜索的关键字使用Lucene各版本对应的算法特性，比如跳跃表、TSF算法...用最快的时间拿到对应的文档。
然后根据业务的需要取文档中的field域。
按照这个特性，我可以使用Lucene完成站内数据搜索，或者归纳爬虫的资源等等。
## 能做成什么程度
Lucene不同于使用Sql语句往返数据库查询操作，它的交互过程是由系统IO实现的。
正因如此，计算机亿级单位速度的IO操作有着Sql查询远远无法达到的速度量级。
不过也因IO操作，使用Lucene的场合一般是在大环境下使用的，在百万级数据量的业务中，Lucene占有很大优势，但在数据量少的前提下，Sql更为出色。IO操作也有很多系统和代码上的局限性，所以Lucene使用过程中还需要代码捕捉它的漏洞。
## 怎么做
### 第一步，依赖
```pom
<!--Lucene依赖-->
        <dependency>
            <groupId>org.apache.lucene</groupId>
            <artifactId>lucene-core</artifactId>
            <version>7.6.0</version>
        </dependency>
        <!-- Lucene的查询解析器 -->
        <dependency>
            <groupId>org.apache.lucene</groupId>
            <artifactId>lucene-queryparser</artifactId>
            <version>7.6.0</version>
        </dependency>
        <!-- lucene的默认分词器库 -->
        <dependency>
            <groupId>org.apache.lucene</groupId>
            <artifactId>lucene-analyzers-common</artifactId>
            <version>7.6.0</version>
        </dependency>
        <!-- lucene的高亮显示 -->
        <dependency>
            <groupId>org.apache.lucene</groupId>
            <artifactId>lucene-highlighter</artifactId>
            <version>7.6.0</version>
        </dependency>
        <!-- ik分词器 -->
        <dependency>
            <groupId>com.janeluo</groupId>
            <artifactId>ikanalyzer</artifactId>
            <version>2012_u6</version>
        </dependency>
```
### 第二步，重写Analyzer和Tokenizer
这是很重要的一步，也是在使用Lucene很想很想吐槽的一步。
作为很重要的一环分词器Analyzer
【将你规定的索引文档；比如一篇文档，你规定标题需要分词，分词器就将标题 [我爱中国] 分成 [我] [爱] [我爱] [中国]这样，作为关键词搜索的key存入索引库中】
Lucene对中文分词器很不友好，好不容易有一款比较适合中文的分词器ikanalyzer,IK分词器，在2012年就停止更新。但因为Lucene还在持续更新，IK里很多字段已经不兼容新版本的Lucene使用。
所以我们需要重写分词器，填充新版本的字段名
#### Analyzer
```
package com.blog.api.lucene;
import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.Tokenizer;

public final class MyIKAnalyzer extends Analyzer {
    private boolean useSmart;

    public boolean useSmart() {
        return this.useSmart;
    }

    public void setUseSmart(boolean useSmart) {
        this.useSmart = useSmart;
    }

    public MyIKAnalyzer() {
        this(false);
    }

    @Override
    protected TokenStreamComponents createComponents(String s) {
        Tokenizer _MyIKTokenizer = new MyIKTokenizer(this.useSmart());
        return new TokenStreamComponents(_MyIKTokenizer);
    }

    public MyIKAnalyzer(boolean useSmart) {
        this.useSmart = useSmart;
    }

}
```
#### Tokenizer
```
package com.blog.api.lucene;

import java.io.IOException;
import org.apache.lucene.analysis.Tokenizer;
import org.apache.lucene.analysis.tokenattributes.CharTermAttribute;
import org.apache.lucene.analysis.tokenattributes.OffsetAttribute;
import org.apache.lucene.analysis.tokenattributes.TypeAttribute;
import org.wltea.analyzer.core.IKSegmenter;
import org.wltea.analyzer.core.Lexeme;

public final class MyIKTokenizer extends Tokenizer {
    private IKSegmenter _IKImplement;
    private final CharTermAttribute termAtt = (CharTermAttribute)this.addAttribute(CharTermAttribute.class);
    private final OffsetAttribute offsetAtt = (OffsetAttribute)this.addAttribute(OffsetAttribute.class);
    private final TypeAttribute typeAtt = (TypeAttribute)this.addAttribute(TypeAttribute.class);
    private int endPosition;

    public MyIKTokenizer(boolean useSmart) {
        this._IKImplement = new IKSegmenter(this.input, useSmart);
    }

    public boolean incrementToken() throws IOException {
        this.clearAttributes();
        Lexeme nextLexeme = this._IKImplement.next();
        if (nextLexeme != null) {
            this.termAtt.append(nextLexeme.getLexemeText());
            this.termAtt.setLength(nextLexeme.getLength());
            this.offsetAtt.setOffset(nextLexeme.getBeginPosition(), nextLexeme.getEndPosition());
            this.endPosition = nextLexeme.getEndPosition();
            this.typeAtt.setType(nextLexeme.getLexemeTypeString());
            return true;
        } else {
            return false;
        }
    }

    public void reset() throws IOException {
        super.reset();
        this._IKImplement.reset(this.input);
    }

    public final void end() {
        int finalOffset = this.correctOffset(this.endPosition);
        this.offsetAtt.setOffset(finalOffset, finalOffset);
    }
}
```

### 第三步，使用已有的数据创建索引库.
```
    /**
     * 创建blog 索引库文档
     */
    public void addBlogDir(List<BlogDTO> blogs) throws IOException {
        List<Document> documents=new ArrayList<>();
        //创建索引库位置
        Directory directory= FSDirectory.open(FileSystems.getDefault().getPath("C:/dir/blogDir"));
        //IK 分词器
        Analyzer analyzer = new MyIKAnalyzer();
        //创建输出流 write
        IndexWriterConfig indexWriterConfig = new IndexWriterConfig(analyzer);
        IndexWriter indexWriter = new IndexWriter(directory,indexWriterConfig);

        for(BlogDTO blogDTO:blogs){
            Document document=new Document();
            //记录标题和id即可
            Field id=new TextField("id",String.valueOf(blogDTO.getId()), Field.Store.YES);
            Field title=new TextField("title",blogDTO.getTitle(), Field.Store.YES);
            document.add(id);
            document.add(title);
            documents.add(document);
        }
        //一次处理
        indexWriter.addDocuments(documents);
        //关闭输出流
        indexWriter.close();
    }
```
这里也是因为Lucene没有中文文档，所以很多的方法和参数名不敢直说明白，有需要的可以在网上查查对应的参数名意义。
但索引文档中比较关键的就是它的Field域。
### 第四步，使用关键字查询索引库[分页查询+高亮显示关键字]
```
 /**
     * 关键词搜索博客索引库
     * @param key
     * @param size
     * @param index
     * @return
     */
    public LuceneDTO getBlogDir(String key, Integer index, Integer size) throws IOException, ParseException, InvalidTokenOffsetsException {
        List<BlogDTO> result=new ArrayList<>();
        Analyzer analyzer=new MyIKAnalyzer();
        //关键词
        QueryParser qp = new QueryParser("title",analyzer);
        Query query=qp.parse(key);

        //高亮关键字
        SimpleHTMLFormatter simpleHTMLFormatter = new SimpleHTMLFormatter("<span style='color:red'>", "</span>");
        Highlighter highlighter = new Highlighter(simpleHTMLFormatter, new QueryScorer(query));

        //打开索引库输入流
        Directory directory=FSDirectory.open(FileSystems.getDefault().getPath("C:/dir/blogDir"));
        IndexReader indexReader = DirectoryReader.open(directory);
        IndexSearcher indexSearcher=new IndexSearcher(indexReader);
        //上一页的结果
        ScoreDoc lastScoreDoc = getLastScoreDoc(index, size, query, indexSearcher);

        //从上一页最后一条数据开始查询  达到分页的目的
        TopDocs topDocs = indexSearcher.searchAfter(lastScoreDoc, query, size);
        long totle=topDocs.totalHits;
        for(ScoreDoc scoreDoc:topDocs.scoreDocs){
            //获得对应的文档
            Document doc = indexSearcher.doc(scoreDoc.doc);
            String title=doc.get("title");
            TokenStream tokenStream = analyzer.tokenStream("title", new StringReader(title));
            result.add(BlogDTO.builder().id(Integer.valueOf(doc.get("id"))).title(highlighter.getBestFragment(tokenStream,title)).build());
        }
        indexReader.close();
        LuceneDTO luceneDTO=new LuceneDTO();
        luceneDTO.setListData(result);
        luceneDTO.setTotole(totle);
        return luceneDTO;
    }

    private ScoreDoc getLastScoreDoc(int pageIndex, int pageSize, Query query, IndexSearcher indexSearcher) throws IOException{
        if(pageIndex==1)return null;
        //获取上一页的数量
        int num = pageSize*(pageIndex-1);
        TopDocs tds = indexSearcher.search(query, num);
        return tds.scoreDocs[num-1];
    }
```
## 总结
Lucene的简单使用就是这样了，Lucene还有很多很多的复杂使用场景。比如搜索的关键字，他可以是个值区间或是组合关键词；高级使用的排序功能等等...
不过都躲不开一点，和磁盘的IO交互，所以Lucene的优化，在总的上来说就是对其IO优化的处理。
:::align-center
![44e0e286c9177f3e58b85c6e7fcf3bc79e3d56e9.jpg](https://leyuna-blog-img.oss-cn-hangzhou.aliyuncs.com/image/2021-09-13/44e0e286c9177f3e58b85c6e7fcf3bc79e3d56e9.jpg)width="auto" height="auto"
:::
