import * as React from 'react';
import { useODFNamespaceSelector } from '@odf/core/redux/selectors';
import {
  clusterVersionResource,
  storageClusterResource,
} from '@odf/core/resources';
import { getStorageClusterInNs } from '@odf/core/utils';
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
} from '@odf/shared/utils';
import {
  HealthState,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';
import classNames from 'classnames';
import * as _ from 'lodash-es';
import {
  DescriptionList,
  DescriptionListTerm,
  DescriptionListGroup,
  DescriptionListDescription,
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
import './StorageClusterCard.scss';

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
            <GridItem md={8} rowSpan={2} sm={12}>
              Doughnut chart
            </GridItem>
            <GridItem md={4} sm={12}>
              View storage
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
