package com.orange.quartz.domain;

/**
 * 定时任务模板参数定义
 * 
 * 描述快捷创建模式下某个任务方法的一个参数：
 * 类型决定前端渲染控件（文本/开关/数字），
 * 生成调用目标时根据类型拼接正确格式。
 * 
 * @author orange
 */
public class TemplateParam
{
    /** 参数名（对应方法形参） */
    private String name;

    /** 中文标签 */
    private String label;

    /** 类型：string / boolean / int / long / double */
    private String type;

    /** 默认值 */
    private String defaultValue;

    public TemplateParam()
    {
    }

    public TemplateParam(String name, String label, String type, String defaultValue)
    {
        this.name = name;
        this.label = label;
        this.type = type;
        this.defaultValue = defaultValue;
    }

    public String getName()
    {
        return name;
    }

    public void setName(String name)
    {
        this.name = name;
    }

    public String getLabel()
    {
        return label;
    }

    public void setLabel(String label)
    {
        this.label = label;
    }

    public String getType()
    {
        return type;
    }

    public void setType(String type)
    {
        this.type = type;
    }

    public String getDefaultValue()
    {
        return defaultValue;
    }

    public void setDefaultValue(String defaultValue)
    {
        this.defaultValue = defaultValue;
    }
}
