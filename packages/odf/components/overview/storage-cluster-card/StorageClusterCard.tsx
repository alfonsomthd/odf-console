import * as React from 'react';
import { useCustomTranslation } from '@odf/shared/useCustomTranslationHook';
import classNames from 'classnames';
import {
  Card,
  CardBody,
  CardHeader,
  CardProps,
  CardTitle,
} from '@patternfly/react-core';

export const StorageClusterCard: React.FC<CardProps> = ({ className }) => {
  const { t } = useCustomTranslation();

  // const { namespace: clusterNs } = useParams<ODFSystemParams>();
  // const { systemFlags } = useODFSystemFlagsSelector();

  return (
    <Card className={classNames(className)} isFlat={true}>
      <CardHeader>
        <CardTitle>{t('Storage cluster')}</CardTitle>
      </CardHeader>
      <CardBody></CardBody>
    </Card>
  );
};
