package com.orange.quartz.domain;

import java.util.List;

/**
 * 定时任务模板
 * 
 * 用于「快捷创建」模式下，向用户展示可安全调用的任务方法，
 * 避免手工记忆 Bean 调用格式与参数写法。
 * 
 * @author orange
 */
public class JobTemplate
{
    /** 分类：system 系统任务 / maintenance 数据维护 / message 消息通知 */
    private String category;

    /** 中文名称 */
    private String name;

    /** Spring Bean 名称 */
    private String beanName;

    /** 方法名 */
    private String methodName;

    /** 用途说明 */
    private String description;

    /** 风险等级：low / medium / high */
    private String riskLevel;

    /** 参数定义 */
    private List<TemplateParam> parameters;

    public JobTemplate()
    {
    }

    public JobTemplate(String category, String name, String beanName, String methodName,
            String description, String riskLevel, List<TemplateParam> parameters)
    {
        this.category = category;
        this.name = name;
        this.beanName = beanName;
        this.methodName = methodName;
        this.description = description;
        this.riskLevel = riskLevel;
        this.parameters = parameters;
    }

    public String getCategory()
    {
        return category;
    }

    public void setCategory(String category)
    {
        this.category = category;
    }

    public String getName()
    {
        return name;
    }

    public void setName(String name)
    {
        this.name = name;
    }

    public String getBeanName()
    {
        return beanName;
    }

    public void setBeanName(String beanName)
    {
        this.beanName = beanName;
    }

    public String getMethodName()
    {
        return methodName;
    }

    public void setMethodName(String methodName)
    {
        this.methodName = methodName;
    }

    public String getDescription()
    {
        return description;
    }

    public void setDescription(String description)
    {
        this.description = description;
    }

    public String getRiskLevel()
    {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel)
    {
        this.riskLevel = riskLevel;
    }

    public List<TemplateParam> getParameters()
    {
        return parameters;
    }

    public void setParameters(List<TemplateParam> parameters)
    {
        this.parameters = parameters;
    }
}
