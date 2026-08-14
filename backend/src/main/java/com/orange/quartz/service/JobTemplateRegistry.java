package com.orange.quartz.service;

import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;
import com.orange.quartz.domain.JobTemplate;
import com.orange.quartz.domain.TemplateParam;

/**
 * 定时任务模板注册表
 * 
 * 显式注册允许通过「快捷创建」调度的任务方法。
 * 安全原则：只允许注册表中声明的方法被快捷模式选中，
 * 不做 Spring Bean 自动扫描，避免暴露任意 Bean 方法。
 * 
 * @author orange
 */
@Service
public class JobTemplateRegistry
{
    private final List<JobTemplate> templates = new ArrayList<>();

    public JobTemplateRegistry()
    {
        registerOrangeTaskTemplates();
    }

    /** 注册 orangeTask 相关模板 */
    private void registerOrangeTaskTemplates()
    {
        // 无参数测试任务
        templates.add(new JobTemplate("system", "无参数测试任务", "orangeTask", "orangeNoParams",
                "验证定时调度服务是否正常，无参数，直接调用即可。", "low", new ArrayList<>()));

        // 单参数测试任务
        List<TemplateParam> params = new ArrayList<>();
        params.add(new TemplateParam("params", "参数内容", "string", "orange"));
        templates.add(new JobTemplate("system", "单参数测试任务", "orangeTask", "orangeParams",
                "带一个字符串参数的测试任务，用于验证参数传递是否正常。", "low", params));

        // 多参数测试任务
        List<TemplateParam> multiParams = new ArrayList<>();
        multiParams.add(new TemplateParam("s", "字符串参数", "string", "orange"));
        multiParams.add(new TemplateParam("b", "布尔参数", "boolean", "true"));
        multiParams.add(new TemplateParam("l", "长整型参数", "long", "2000"));
        multiParams.add(new TemplateParam("d", "浮点参数", "double", "316.5"));
        multiParams.add(new TemplateParam("i", "整型参数", "int", "100"));
        templates.add(new JobTemplate("system", "多参数测试任务", "orangeTask", "orangeMultipleParams",
                "验证字符串、布尔、长整型、浮点、整型五类参数的拼接与传递。", "medium", multiParams));
    }

    /** 返回全部模板（按注册顺序） */
    public List<JobTemplate> listTemplates()
    {
        return templates;
    }

    /**
     * 根据模板唯一标识（beanName.methodName）查找模板
     */
    public JobTemplate findTemplate(String beanName, String methodName)
    {
        for (JobTemplate t : templates)
        {
            if (t.getBeanName().equals(beanName) && t.getMethodName().equals(methodName))
            {
                return t;
            }
        }
        return null;
    }
}
