import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import zxcvbn from 'zxcvbn';
import { useNewMetricEvent } from '../../../hooks/useMetricEvent';
import { useI18nContext } from '../../../hooks/useI18nContext';
import Button from '../../../components/ui/button';
import Typography from '../../../components/ui/typography';
import {
  TEXT_ALIGN,
  TYPOGRAPHY,
  JUSTIFY_CONTENT,
  FONT_WEIGHT,
  ALIGN_ITEMS,
} from '../../../helpers/constants/design-system';
import {
  ONBOARDING_COMPLETION_ROUTE,
  ONBOARDING_SECURE_YOUR_WALLET_ROUTE,
} from '../../../helpers/constants/routes';
import FormField from '../../../components/ui/form-field';
import Box from '../../../components/ui/box';
import CheckBox from '../../../components/ui/check-box';
import {
  ThreeStepProgressBar,
  threeStepStages,
  TwoStepProgressBar,
  twoStepStages,
} from '../../../components/app/step-progress-bar';
import ZENDESK_URLS from '../../../helpers/constants/zendesk-url';

export default function CreatePassword({
  createNewAccount,
  importWithRecoveryPhrase,
  secretRecoveryPhrase,
}) {
  const t = useI18nContext();
  const [confirmPassword, setConfirmPassword] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');
  const [passwordStrengthText, setPasswordStrengthText] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [termsChecked, setTermsChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const history = useHistory();

  const submitPasswordEvent = useNewMetricEvent({
    event: 'Submit Password',
    category: 'Onboarding',
  });

  const isValid = useMemo(() => {
    if (!password || !confirmPassword || password !== confirmPassword) {
      return false;
    }

    if (password.length < 8) {
      return false;
    }

    return !passwordError && !confirmPasswordError;
  }, [password, confirmPassword, passwordError, confirmPasswordError]);

  const handlePasswordChange = (passwordInput) => {
    let confirmError = '';
    let passwordStrengthDescription = '';
    let passwordStrengthInput;
    const passwordEvaluation = zxcvbn(passwordInput);

    switch (passwordEvaluation.score) {
      case 0:
        passwordStrengthInput = t('passwordStrength', [
          <span
            key={passwordEvaluation.score}
            className="create-password__form__weak"
          >
            {t('weak')}
          </span>,
        ]);
        passwordStrengthDescription = t('passwordStrengthDescription');
        break;
      case 1:
        passwordStrengthInput = t('passwordStrength', [
          <span
            key={passwordEvaluation.score}
            className="create-password__form__weak"
          >
            {t('weak')}
          </span>,
        ]);
        passwordStrengthDescription = t('passwordStrengthDescription');
        break;
      case 2:
        passwordStrengthInput = t('passwordStrength', [
          <span
            key={passwordEvaluation.score}
            className="create-password__form__weak"
          >
            {t('weak')}
          </span>,
        ]);
        passwordStrengthDescription = t('passwordStrengthDescription');
        break;
      case 3:
        passwordStrengthInput = t('passwordStrength', [
          <span
            key={passwordEvaluation.score}
            className="create-password__form__average"
          >
            {t('average')}
          </span>,
        ]);
        passwordStrengthDescription = t('passwordStrengthDescription');
        break;
      case 4:
        passwordStrengthInput = t('passwordStrength', [
          <span
            key={passwordEvaluation.score}
            className="create-password__form__strong"
          >
            {t('strong')}
          </span>,
        ]);
        break;
      default:
        break;
    }

    if (confirmPassword && passwordInput !== confirmPassword) {
      confirmError = t('passwordsDontMatch');
    }

    setPassword(passwordInput);
    setPasswordStrength(passwordStrengthInput);
    setPasswordStrengthText(passwordStrengthDescription);
    setConfirmPasswordError(confirmError);
  };

  const handleConfirmPasswordChange = (confirmPasswordInput) => {
    let error = '';
    if (password !== confirmPasswordInput) {
      error = t('passwordsDontMatch');
    }

    setConfirmPassword(confirmPasswordInput);
    setConfirmPasswordError(error);
  };

  const handleCreate = async (event) => {
    event.preventDefault();

    if (!isValid) {
      return;
    }
    // If secretRecoveryPhrase is defined we are in import wallet flow
    if (secretRecoveryPhrase) {
      await importWithRecoveryPhrase(password, secretRecoveryPhrase);
      history.push(ONBOARDING_COMPLETION_ROUTE);
    } else {
      // Otherwise we are in create new wallet flow
      try {
        if (createNewAccount) {
          await createNewAccount(password);
        }
        submitPasswordEvent();
        history.push(ONBOARDING_SECURE_YOUR_WALLET_ROUTE);
      } catch (error) {
        setPasswordError(error.message);
      }
    }
  };

  return (
    <div className="create-password__wrapper">
      {secretRecoveryPhrase ? (
        <TwoStepProgressBar stage={twoStepStages.PASSWORD_CREATE} />
      ) : (
        <ThreeStepProgressBar stage={threeStepStages.PASSWORD_CREATE} />
      )}
      <Typography variant={TYPOGRAPHY.H2} fontWeight={FONT_WEIGHT.BOLD}>
        {t('createPassword')}
      </Typography>
      <Typography
        variant={TYPOGRAPHY.H4}
        align={TEXT_ALIGN.CENTER}
        boxProps={{ margin: 5 }}
      >
        {t('passwordSetupDetails')}
      </Typography>
      <Box
        justifyContent={JUSTIFY_CONTENT.CENTER}
        marginTop={3}
        padding={[0, 12]}
      >
        <form className="create-password__form" onSubmit={handleCreate}>
          <FormField
            dataTestId="create-password-new"
            autoFocus
            passwordStrength={passwordStrength}
            passwordStrengthText={passwordStrengthText}
            onChange={handlePasswordChange}
            password={!showPassword}
            titleText={t('newPassword')}
            value={password}
            titleDetail={
              <button
                className="create-password__form--password-button"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowPassword(!showPassword);
                }}
              >
                {showPassword ? t('hide') : t('show')}
              </button>
            }
          />
          <FormField
            dataTestId="create-password-confirm"
            onChange={handleConfirmPasswordChange}
            password={!showPassword}
            error={confirmPasswordError}
            titleText={t('confirmPassword')}
            value={confirmPassword}
            titleDetail={
              isValid && (
                <div className="create-password__form--checkmark">
                  <i className="fas fa-check" />
                </div>
              )
            }
          />
          <Box
            alignItems={ALIGN_ITEMS.CENTER}
            justifyContent={JUSTIFY_CONTENT.SPACE_BETWEEN}
            marginBottom={4}
          >
            <CheckBox
              dataTestId="create-password-terms"
              onClick={() => setTermsChecked(!termsChecked)}
              checked={termsChecked}
            />
            <Typography variant={TYPOGRAPHY.H5} boxProps={{ marginLeft: 3 }}>
              {t('passwordTermsWarning', [
                <a
                  onClick={(e) => e.stopPropagation()}
                  key="create-password__link-text"
                  href={ZENDESK_URLS.PASSWORD_ARTICLE}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="create-password__link-text">
                    {t('learnMoreUpperCase')}
                  </span>
                </a>,
              ])}
            </Typography>
          </Box>
          <Button
            data-testid={
              secretRecoveryPhrase
                ? 'create-password-import'
                : 'create-password-wallet'
            }
            type="primary"
            className="create-password__form--submit-button"
            disabled={!isValid || !termsChecked}
            onClick={handleCreate}
          >
            {secretRecoveryPhrase ? t('importMyWallet') : t('createNewWallet')}
          </Button>
        </form>
      </Box>
    </div>
  );
}

CreatePassword.propTypes = {
  createNewAccount: PropTypes.func,
  importWithRecoveryPhrase: PropTypes.func,
  secretRecoveryPhrase: PropTypes.string,
};
