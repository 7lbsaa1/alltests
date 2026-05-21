// تفاعلات إضافية عند تحميل الصفحة بنجاح
document.addEventListener('DOMContentLoaded', () => {
    console.log("Welcome to 7lbsaa Videos Platform! All cards initialized successfully.");
    
    // يمكنك إضافة أي مؤثرات صوتية أو برمجية هنا مستقبلاً عند الضغط على الأزرار
    const buttons = document.querySelectorAll('.watch-btn');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            // كود إضافي اختياري في حالة رغبتك في تتبع نقرات المستخدم
        });
    });
});
