import LoginForm from "@/components/auth/LoginForm";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { useTranslation } from "react-i18next";

export default function LoginPage() {
  const { t } = useTranslation();

  return (
    <AuthLayout
      title={t('AUTH.LOGIN.TITLE')}
      subtitle={t('AUTH.LOGIN.SUBTITLE')}
    >
      <LoginForm />
    </AuthLayout>
  );
}
