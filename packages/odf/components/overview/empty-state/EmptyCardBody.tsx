import * as React from 'react';
import * as _ from 'lodash-es';
import {
  Button,
  EmptyState,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateActions,
} from '@patternfly/react-core';
import { StorageDomainIcon } from '@patternfly/react-icons';
import './EmptyCardBody.scss';

type EmptyCardBodyProps = {
  actionHref: string;
  actionText: string;
  bodyContent: React.ReactNode;
  headerText: string;
};

export const EmptyCardBody: React.FC<EmptyCardBodyProps> = ({
  actionHref,
  actionText,
  bodyContent,
  headerText,
}) => {
  return (
    <EmptyState>
      <EmptyStateHeader
        titleText={headerText}
        headingLevel="h6"
        icon={<EmptyStateIcon icon={StorageDomainIcon} />}
      />
      <EmptyStateBody>{bodyContent}</EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <Button
            variant="secondary"
            component="a"
            href={actionHref}
            className="odf-empty-card__action"
          >
            {actionText}
          </Button>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};
