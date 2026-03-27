INSERT INTO public.courses (slug, title, description)
VALUES (
    'rocketry-engineer',
    '探空火箭工程实践',
    '从原理溯源到数字化建模，从电子信息实践到外场发射演练，完成火箭全生命周期研发。'
) ON CONFLICT (slug) DO UPDATE 
SET title = EXCLUDED.title, description = EXCLUDED.description;

DELETE FROM public.slides WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'rocketry-engineer');

INSERT INTO public.slides (course_id, order_index, title, content, interaction_config)
VALUES 
((SELECT id FROM public.courses WHERE slug = 'rocketry-engineer'), 0, '原理溯源与数字化建模', '走进电子工业发展史，建立系统工程意识。学习火箭五大子系统：结构、动力、回收、控制、通信。', '{"kernelId": "qC0KuF7GS2"}'),
((SELECT id FROM public.courses WHERE slug = 'rocketry-engineer'), 1, '电路之魂：PCB 设计基础', '学习航天级 PCB 的布局逻辑，掌握高频信号完整性与特性阻抗匹配。', '{"kernelId": "Sla8HZHhaJ"}'),
((SELECT id FROM public.courses WHERE slug = 'rocketry-engineer'), 2, '空气动力学：揭开飞行的奥秘', '分析重心（CG）与压心（CP）的动态平衡，探讨推力产生的物理逻辑。', '{"kernelId": "qC0KuF7GS2"}'),
((SELECT id FROM public.courses WHERE slug = 'rocketry-engineer'), 3, '数字化双胞胎：OpenRocket 仿真', '输入 3D 打印材料物理参数，进行全弹道仿真，预测最高升限。', '{"kernelId": "Sla8HZHhaJ"}'),
((SELECT id FROM public.courses WHERE slug = 'rocketry-engineer'), 4, '火箭的大脑：嵌入式开发', '学习控制系统的核心逻辑：传感器初始化、循环检测与实时信号处理。', '{"kernelId": "qC0KuF7GS2"}'),
((SELECT id FROM public.courses WHERE slug = 'rocketry-engineer'), 5, '空间感知：IMU 惯导数据融合', '理解 I2C 通信协议，通过滤波算法实现高精度姿态解算。', '{"kernelId": "Sla8HZHhaJ"}'),
((SELECT id FROM public.courses WHERE slug = 'rocketry-engineer'), 6, '高度解算：气压计应用', '利用气压变化实时计算海拔，并加入卡尔曼滤波优化数据。', '{"kernelId": "qC0KuF7GS2"}'),
((SELECT id FROM public.courses WHERE slug = 'rocketry-engineer'), 7, '航电总装：飞控系统组装', '掌握精密焊接技术与元器件布局，确保整机通电测试 100% 成功。', '{"kernelId": "Sla8HZHhaJ"}'),
((SELECT id FROM public.courses WHERE slug = 'rocketry-engineer'), 8, '3D 成型：火箭本体结构', '使用 PETG/ASA 高强度材料构建本体，设计蛋舱保护结构。', '{"kernelId": "qC0KuF7GS2"}'),
((SELECT id FROM public.courses WHERE slug = 'rocketry-engineer'), 9, '安全降落：开伞回收算法', '编写基于加速度突变的智能抛伞算法，实现开伞系统的自动触发。', '{"kernelId": "Sla8HZHhaJ"}'),
((SELECT id FROM public.courses WHERE slug = 'rocketry-engineer'), 10, '无线空地链路：LoRa 遥测', '实现飞行参数实时回传至地面站，构建完整的数字化指挥中心。', '{"kernelId": "qC0KuF7GS2"}'),
((SELECT id FROM public.courses WHERE slug = 'rocketry-engineer'), 11, '发射日：实地发射与采集', '从点火到回收的全生命周期闭环实践，采集真实飞行航迹数据。', '{"kernelId": "Sla8HZHhaJ"}');
