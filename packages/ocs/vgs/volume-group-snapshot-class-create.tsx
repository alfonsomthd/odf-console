import * as React from 'react';
import { FormGroupController } from '@odf/shared/form-group-controller';
import { ButtonBar } from '@odf/shared/generic/ButtonBar';
import { useCustomTranslation } from '@odf/shared/useCustomTranslationHook';
import { Helmet } from 'react-helmet';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom-v5-compat';
import {
  ActionGroup,
  Button,
  Form,
  FormGroup,
  FormSelect,
  FormSelectOption,
  TextInput,
  ValidatedOptions,
} from '@patternfly/react-core';
import '@odf/core/components/mcg/create-obc.scss';
import '@odf/core/style.scss';
import { CSI_DRIVER, VOLUME_SNAPSHOT_DELETION_POLICY } from '../constants';

type FormData = {
  name: string;
  driver: CSI_DRIVER;
  deletionPolicy: VOLUME_SNAPSHOT_DELETION_POLICY;
};

const csiDrivers = Object.values(CSI_DRIVER);
const deletionPolicies = Object.values(VOLUME_SNAPSHOT_DELETION_POLICY);

export const CreateVolumeGroupSnapshotClass: React.FC<{}> = () => {
  const { t } = useCustomTranslation();
  const navigate = useNavigate();
  // const [driver, setDriver] = React.useState<CSI_DRIVER>();
  const [deletionPolicy, setDeletionPolicy] =
    React.useState<VOLUME_SNAPSHOT_DELETION_POLICY>();
  const [inProgress, setProgress] = React.useState(false);
  const [error, setError] = React.useState<Error>();
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const onSubmit: SubmitHandler<FormData> = (data) => {
    //@TODO: create CR.
    try {
      setProgress(true);
      return data;
    } catch (e) {
      setError(e);
      setProgress(false);
    }
  };

  return (
    <div className="odf-m-pane__body odf-m-pane__form">
      <Helmet>
        <title>{t('Create VolumeGroupSnapshotClass')}</title>
      </Helmet>
      <h1 className="odf-m-pane__heading odf-m-pane__heading--baseline">
        <div>{t('Create VolumeGroupSnapshotClass')}</div>
      </h1>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <FormGroup label={t('Name')} fieldId="name" isRequired>
          <TextInput
            {...register('name', { required: true, max: 253 })}
            aria-label={t('Name')}
            placeholder="my-vgsclass"
            validated={
              errors.name ? ValidatedOptions.error : ValidatedOptions.default
            }
          />
        </FormGroup>
        {/* <FormGroup label={t('Driver')}
            fieldId="driver"
            isRequired>
        <FormSelect {...register('driver', { required: true })}
         aria-label={t('Driver')} value={driver} onChange={(_, value: CSI_DRIVER) => {console.log('LLLD', value); setDriver(value)}}
         validated={errors.driver ? ValidatedOptions.error : ValidatedOptions.default}>
          <FormSelectOption key={'select'} label={'Select driver'} isDisabled />
          {csiDrivers.map((option) => (
            <FormSelectOption key={option} value={option} label={option} />
          ))}
        </FormSelect>
        </FormGroup> */}
        <FormGroupController
          name="driver"
          control={control}
          // defaultValue={BC_PROVIDERS.AWS}
          formGroupProps={{
            label: t('Driver'),
            fieldId: 'driver',
            // className: 'nb-endpoints-form-entry',
            isRequired: true,
          }}
          rules={{ required: true }}
          render={({ onChange }) => (
            <FormSelect
              aria-label={t('Driver')}
              onChange={onChange}
              validated={
                errors.driver
                  ? ValidatedOptions.error
                  : ValidatedOptions.default
              }
            >
              <FormSelectOption
                key={'select'}
                label={'Select driver'}
                isDisabled
              />
              {csiDrivers.map((option) => (
                <FormSelectOption key={option} value={option} label={option} />
              ))}
            </FormSelect>
          )}
        />
        <FormGroup
          label={t('Deletion Policy')}
          fieldId="deletionPolicy"
          isRequired
        >
          <FormSelect
            {...register('deletionPolicy', { required: true })}
            aria-label={t('Deletion Policy')}
            value={deletionPolicy}
            onChange={(_, value: VOLUME_SNAPSHOT_DELETION_POLICY) =>
              setDeletionPolicy(value)
            }
            validated={
              errors.deletionPolicy
                ? ValidatedOptions.error
                : ValidatedOptions.default
            }
          >
            {deletionPolicies.map((option) => (
              <FormSelectOption key={option} value={option} label={option} />
            ))}
          </FormSelect>
        </FormGroup>
        <ButtonBar inProgress={inProgress} errorMessage={error?.message}>
          <ActionGroup className="pf-v5-c-form">
            <Button id="vgsc-submit" type="submit" variant="primary">
              {t('Create')}
            </Button>
            <Button
              onClick={() => navigate('/odf/vgsc')}
              type="button"
              variant="secondary"
            >
              {t('Cancel')}
            </Button>
          </ActionGroup>
        </ButtonBar>
      </Form>
    </div>
  );
};

export default CreateVolumeGroupSnapshotClass;
