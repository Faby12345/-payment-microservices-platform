package app.transferservice.dto.bnr;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlElementWrapper;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;
import lombok.Data;

import java.util.List;

@Data
@JacksonXmlRootElement(localName = "DataSet", namespace = "http://www.bnr.ro/xsd")
public class BnrDataSet {
    @JacksonXmlProperty(localName = "Header")
    private Header header;

    @JacksonXmlProperty(localName = "Body")
    private Body body;

    @Data
    public static class Header {
        @JacksonXmlProperty(localName = "Publisher")
        private String publisher;
        @JacksonXmlProperty(localName = "PublishingDate")
        private String publishingDate;
    }

    @Data
    public static class Body {
        @JacksonXmlProperty(localName = "Cube")
        private Cube cube;
    }

    @Data
    public static class Cube {
        @JacksonXmlProperty(isAttribute = true)
        private String date;

        @JacksonXmlElementWrapper(useWrapping = false)
        @JacksonXmlProperty(localName = "Rate")
        private List<BnrRate> rates;
    }

    @Data
    public static class BnrRate {
        @JacksonXmlProperty(isAttribute = true)
        private String currency;

        @JacksonXmlProperty(isAttribute = true)
        private Integer multiplier;

        @com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlText
        private String value;
    }
}
