import * as React from 'react';
import { GeneralOverviewActivityCard } from '@odf/core/components/overview/activity-card/GeneralOverviewActivityCard';
import { ObjectStorageCard } from '@odf/core/components/overview/object-storage-card/ObjectStorageCard';
import { StorageClusterCard } from '@odf/core/components/overview/storage-cluster-card/StorageClusterCard';
import { PageHeading, useCustomTranslation } from '@odf/shared';
import { Helmet } from 'react-helmet';
import { Grid, GridItem } from '@patternfly/react-core';
import './Overview.scss';

const Overview: React.FC = () => {
  const { t } = useCustomTranslation();
  const title = t('Overview');

  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <PageHeading title={title} hasUnderline={false} />
      <Grid hasGutter className="odf-general-overview__grid">
        <GridItem md={8} sm={12}>
          <StorageClusterCard className="odf-general-overview__card" />
        </GridItem>
        <GridItem md={4} rowSpan={3} sm={12}>
          <GeneralOverviewActivityCard className="odf-general-overview__card" />
        </GridItem>
        <GridItem md={8} sm={12}>
          <ObjectStorageCard className="odf-general-overview__card" />
        </GridItem>
      </Grid>
    </>
  );
};

export default Overview;
