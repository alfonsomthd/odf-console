import * as React from 'react';
import { ObjectStorageOverviewQueries } from '@odf/ocs/queries/object-storage';
import { PrometheusMultilineUtilizationItem } from '@odf/shared/dashboards/utilization-card/prometheus-multi-utilization-item';
// import {
//   useCustomPrometheusPoll,
//   usePrometheusBasePath,
// } from '@odf/shared/hooks/custom-prometheus-poll';
import { useCustomTranslation } from '@odf/shared/useCustomTranslationHook';
import { humanizeNumber } from '@odf/shared/utils/humanize';
import { QueryWithDescription } from '@openshift-console/dynamic-plugin-sdk';
import { UtilizationDurationDropdown } from '@openshift-console/dynamic-plugin-sdk-internal';
import classNames from 'classnames';
import * as _ from 'lodash-es';
import {
  Button,
  ButtonVariant,
  Card,
  CardBody,
  CardHeader,
  CardProps,
  CardTitle,
} from '@patternfly/react-core';
import { ArrowRightIcon } from '@patternfly/react-icons';
import './ObjectStorageCard.scss';

const BUCKETS_PROVISIONED_QUERIES: [
  QueryWithDescription,
  QueryWithDescription,
] = [
  {
    query: ObjectStorageOverviewQueries.NOOBAA_BUCKETS_PROVISIONED,
    desc: 'NooBaa',
  },
  { query: '', desc: 'RGW' }, // @TODO: add RGW query.
];

export const ObjectStorageCard: React.FC<CardProps> = ({ className }) => {
  const { t } = useCustomTranslation();

  // const [usedCapacity, usedCapacityError, usedCapacityLoading] =
  //   useCustomPrometheusPoll({
  //     query: CAPACITY_QUERIES[StorageDashboard.USED_CAPACITY_FILE_BLOCK],
  //     endpoint: 'api/v1/query' as any,
  //     basePath: usePrometheusBasePath(),
  //   });

  return (
    <Card className={classNames(className)} isFlat={true}>
      <CardHeader
        actions={{
          actions: <UtilizationDurationDropdown />,
        }}
      >
        <CardTitle className="pf-v5-u-font-size-lg">
          {t('Object storage')}
        </CardTitle>
      </CardHeader>
      <CardBody className="odf-cluster-card__body">
        <PrometheusMultilineUtilizationItem
          title={t('Buckets provisioned')}
          queries={BUCKETS_PROVISIONED_QUERIES}
          humanizeValue={humanizeNumber}
          chartType="grouped-line"
          className="odf-storage-card__chart"
        />
        <Button
          variant={ButtonVariant.link}
          icon={<ArrowRightIcon />}
          iconPosition="end"
          className="pf-v5-u-font-size-lg pf-v5-u-mt-md odf-cluster-card__storage-link"
          component="a"
          href="/odf/object-storage"
        >
          {t('View buckets')}
        </Button>
      </CardBody>
    </Card>
  );
};
