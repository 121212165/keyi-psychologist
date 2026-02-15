import { useEffect, useState, useCallback } from 'react';
import { useCrisis } from '@/hooks';
import { CrisisModal } from './CrisisModal';
import { RiskBanner } from './RiskBanner';

/**
 * 危机管理器组件
 * - 检测用户输入中的风险
 * - 在需要时显示危机干预
 */
export function CrisisManager({
  children,
}: {
  children: React.ReactNode;
}) {
  const crisis = useCrisis();
  const [showModal, setShowModal] = useState(false);

  // 监听危机触发
  useEffect(() => {
    if (crisis.isTriggered) {
      setShowModal(true);
    }
  }, [crisis.isTriggered]);

  // 关闭弹窗
  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    crisis.dismiss();
  }, [crisis]);

  return (
    <>
      {/* 风险提示条 */}
      <RiskBanner
        level={crisis.riskLevel}
        onDismiss={crisis.dismiss}
      />

      {/* 主内容 */}
      {children}

      {/* 危机干预弹窗 */}
      {showModal && (
        <CrisisModal
          countdown={crisis.countdown}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
