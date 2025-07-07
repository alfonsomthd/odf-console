import * as React from 'react';
import {
  CAPACITY_QUERIES,
  StorageDashboard,
} from '@odf/core/components/odf-dashboard/queries';
import { useODFNamespaceSelector } from '@odf/core/redux/selectors';
import {
  clusterVersionResource,
  storageClusterResource,
} from '@odf/core/resources';
import { getStorageClusterInNs } from '@odf/core/utils';
import { DANGER_THRESHOLD, WARNING_THRESHOLD } from '@odf/ocs/constants/charts';
import { resiliencyProgressQuery } from '@odf/ocs/queries';
import { getDataResiliencyState } from '@odf/ocs/utils';
import {
  ClusterVersionKind,
  DASH,
  getName,
  healthStateMapping,
  healthStateMessage,
  ODF_OPERATOR,
  resourceStatus,
  Status,
  StatusBox,
  StorageClusterKind,
  useFetchCsv,
} from '@odf/shared';
import {
  useCustomPrometheusPoll,
  usePrometheusBasePath,
} from '@odf/shared/hooks/custom-prometheus-poll';
import { useCustomTranslation } from '@odf/shared/useCustomTranslationHook';
import {
  getClusterVersionChannel,
  getOprVersionFromCSV,
  getStorageClusterMetric,
  humanizeBinaryBytes,
} from '@odf/shared/utils';
import {
  HealthState,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';
import { chart_color_blue_100 as general2 } from '@patternfly/react-tokens/dist/js/chart_color_blue_100';
import { chart_color_blue_300 as general1 } from '@patternfly/react-tokens/dist/js/chart_color_blue_300';
import { global_danger_color_100 as danger1 } from '@patternfly/react-tokens/dist/js/global_danger_color_100';
import { global_warning_color_100 as warning1 } from '@patternfly/react-tokens/dist/js/global_warning_color_100';
import classNames from 'classnames';
import * as _ from 'lodash-es';
import { ChartDonut, ChartLabel } from '@patternfly/react-charts';
import {
  DescriptionList,
  DescriptionListTerm,
  DescriptionListGroup,
  DescriptionListDescription,
  Button,
  ButtonVariant,
} from '@patternfly/react-core';
import {
  Card,
  CardBody,
  CardHeader,
  CardProps,
  CardTitle,
  Grid,
  GridItem,
} from '@patternfly/react-core';
import { ArrowRightIcon } from '@patternfly/react-icons';
import './StorageClusterCard.scss';

const generalColorScale = [general1.value, general2.value];
const warningColorScale = [warning1.value, general2.value];
const dangerColorScale = [danger1.value, general2.value];

export const StorageClusterCard: React.FC<CardProps> = ({ className }) => {
  const { t } = useCustomTranslation();
  const [storageClusters, storageClustersLoaded, storageClustersError] =
    useK8sWatchResource<StorageClusterKind[]>(storageClusterResource);
  const { odfNamespace, isNsSafe } = useODFNamespaceSelector();
  const [csv, csvLoaded, csvError] = useFetchCsv({
    specName: ODF_OPERATOR,
    namespace: odfNamespace,
    startPollingInstantly: isNsSafe,
  });
  const [clusterVersionData, clusterVersionLoaded, clusterVersionError] =
    useK8sWatchResource<ClusterVersionKind>(clusterVersionResource);

  const storageCluster: StorageClusterKind = getStorageClusterInNs(
    storageClusters,
    odfNamespace
  );
  const clusterName = getName(storageCluster);
  const [usedCapacity, usedCapacityError, usedCapacityLoading] =
    useCustomPrometheusPoll({
      query: CAPACITY_QUERIES[StorageDashboard.USED_CAPACITY_FILE_BLOCK],
      endpoint: 'api/v1/query' as any,
      basePath: usePrometheusBasePath(),
    });

  const [totalCapacity, totalCapacityError, totalCapacityLoading] =
    useCustomPrometheusPoll({
      query: CAPACITY_QUERIES[StorageDashboard.TOTAL_CAPACITY_FILE_BLOCK],
      endpoint: 'api/v1/query' as any,
      basePath: usePrometheusBasePath(),
    });
  const showCapacity =
    !usedCapacityLoading &&
    _.isEmpty(usedCapacityError) &&
    !totalCapacityLoading &&
    _.isEmpty(totalCapacityError);
  const [resiliencyProgress, resiliencyProgressError] = useCustomPrometheusPoll(
    {
      query: resiliencyProgressQuery(clusterName),
      endpoint: 'api/v1/query' as any,
      basePath: usePrometheusBasePath(),
    }
  );
  const dataResiliencyState = getDataResiliencyState(
    [{ response: resiliencyProgress, error: resiliencyProgressError }],
    t
  );
  const resiliencyMessage =
    dataResiliencyState.state === HealthState.OK
      ? t('Healthy')
      : healthStateMessage(dataResiliencyState.state, t);
  const resiliencyIcon = healthStateMapping?.[dataResiliencyState.state]?.icon;

  const odfVersion =
    csvLoaded && _.isEmpty(csvError) ? getOprVersionFromCSV(csv) : DASH;

  const clusterVersionChannel =
    clusterVersionLoaded && _.isEmpty(clusterVersionError)
      ? getClusterVersionChannel(clusterVersionData)
      : DASH;

  const usedCapacityData = getStorageClusterMetric(
    usedCapacity,
    clusterName,
    odfNamespace
  );
  const totalCapacityData = getStorageClusterMetric(
    totalCapacity,
    clusterName,
    odfNamespace
  );
  const totalCapacityValue = humanizeBinaryBytes(totalCapacityData?.value?.[1]);
  const usedCapacityValue = humanizeBinaryBytes(
    usedCapacityData?.value?.[1],
    null,
    totalCapacityValue?.unit
  );
  const usedCapacityNotRelativeToTotal = humanizeBinaryBytes(
    usedCapacityData?.value?.[1]
  );
  const availableCapacityValue = humanizeBinaryBytes(
    !!usedCapacityData?.value?.[1] && !!totalCapacityData?.value?.[1]
      ? Number(totalCapacityData.value?.[1]) -
          Number(usedCapacityData.value?.[1])
      : 0,
    null,
    totalCapacityValue?.unit
  );
  const donutData = [
    { x: 'Used', y: usedCapacityValue.value, string: usedCapacityValue.string },
    {
      x: 'Available',
      y: availableCapacityValue.value,
      string: availableCapacityValue.string,
    },
  ];

  const capacityRatio = parseFloat(
    (usedCapacityValue.value / totalCapacityValue.value).toFixed(2)
  );

  const colorScale = React.useMemo(() => {
    if (capacityRatio > DANGER_THRESHOLD) return dangerColorScale;
    if (capacityRatio > WARNING_THRESHOLD && capacityRatio <= DANGER_THRESHOLD)
      return warningColorScale;
    return generalColorScale;
  }, [capacityRatio]);

  return (
    <Card className={classNames(className)} isFlat={true}>
      <CardHeader>
        <CardTitle className="pf-v5-u-font-size-lg">
          {t('Storage cluster')}
        </CardTitle>
      </CardHeader>
      <CardBody className="odf-cluster-card__body">
        {storageClustersLoaded && !storageClustersError ? (
          <Grid hasGutter>
            <GridItem md={4} sm={12}>
              <DescriptionList>
                <DescriptionListGroup>
                  <DescriptionListTerm>
                    {t('Cluster Status')}
                  </DescriptionListTerm>
                  <DescriptionListDescription>
                    <Status status={resourceStatus(storageCluster)} />
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Resiliency')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {resiliencyIcon}
                    <span className="pf-v5-u-ml-xs">{resiliencyMessage}</span>
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>
                    {t('Data Foundation version')}
                  </DescriptionListTerm>
                  <DescriptionListDescription>
                    {odfVersion}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>
                    {t('Update channel')}
                  </DescriptionListTerm>
                  <DescriptionListDescription>
                    {clusterVersionChannel}
                  </DescriptionListDescription>
                </DescriptionListGroup>
              </DescriptionList>
            </GridItem>
            <GridItem
              md={8}
              rowSpan={2}
              sm={12}
              className="odf-cluster-card__chart-container"
            >
              {showCapacity ? (
                <ChartDonut
                  ariaDesc={t('Available versus Used Capacity')}
                  ariaTitle={t('Available versus Used Capacity')}
                  height={150}
                  width={300}
                  data={donutData}
                  labels={({ datum }) => `${datum.string}`}
                  title={usedCapacityNotRelativeToTotal.value}
                  subTitle={usedCapacityNotRelativeToTotal.unit}
                  colorScale={colorScale}
                  padding={{ top: 0, bottom: 0, left: 0, right: 140 }}
                  constrainToVisibleArea
                  titleComponent={
                    <ChartLabel className="odf-cluster-card__chart-title" />
                  }
                  subTitleComponent={
                    <ChartLabel
                      className="odf-cluster-card__chart-subtitle"
                      dy={5}
                    />
                  }
                  legendData={[
                    {
                      name: `${t('Used')}: ${usedCapacityNotRelativeToTotal.string}`,
                    },
                    {
                      name: `${t('Available')}: ${availableCapacityValue.string}`,
                    },
                  ]}
                  legendOrientation="vertical"
                  legendPosition="right"
                />
              ) : (
                <>{t('No data available')}</>
              )}
            </GridItem>
            <GridItem md={4} sm={12}>
              <Button
                variant={ButtonVariant.link}
                icon={<ArrowRightIcon />}
                iconPosition="end"
                className="pf-v5-u-font-size-lg odf-cluster-card__storage-link"
                component="a"
                href="/odf/cluster"
              >
                {t('View storage')}
              </Button>
            </GridItem>
          </Grid>
        ) : (
          <StatusBox
            loaded={storageClustersLoaded}
            loadError={storageClustersError}
          />
        )}
      </CardBody>
    </Card>
  );
};
