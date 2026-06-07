import React, { useState } from 'react';
import { ApiError, CandidateInput, createCandidate } from '../api/candidates';
import './AddCandidateForm.css';

type FormErrors = Partial<Record<keyof CandidateInput, string>>;

const emptyForm: CandidateInput = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validate = (values: CandidateInput): FormErrors => {
  const errors: FormErrors = {};
  if (!values.firstName.trim()) errors.firstName = 'El nombre es obligatorio';
  if (!values.lastName.trim()) errors.lastName = 'El apellido es obligatorio';
  if (!values.email.trim()) {
    errors.email = 'El email es obligatorio';
  } else if (!EMAIL_REGEX.test(values.email.trim())) {
    errors.email = 'El email no tiene un formato válido';
  }
  return errors;
};

interface FieldConfig {
  name: keyof CandidateInput;
  label: string;
  type?: string;
  required?: boolean;
  half?: boolean;
}

const fields: FieldConfig[] = [
  { name: 'firstName', label: 'Nombre', required: true, half: true },
  { name: 'lastName', label: 'Apellido', required: true, half: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'phone', label: 'Teléfono' },
  { name: 'address', label: 'Dirección' },
];

const AddCandidateForm: React.FC = () => {
  const [values, setValues] = useState<CandidateInput>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleChange =
    (field: keyof CandidateInput) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setValues((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
      setSuccessMessage(null);
      setServerError(null);
    };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSuccessMessage(null);
    setServerError(null);

    const validationErrors = validate(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload: CandidateInput = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      phone: values.phone?.trim() || undefined,
      address: values.address?.trim() || undefined,
    };

    setSubmitting(true);
    try {
      const candidate = await createCandidate(payload);
      setSuccessMessage(
        `Candidato ${candidate.firstName} ${candidate.lastName} añadido correctamente`
      );
      setValues(emptyForm);
      setErrors({});
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.fieldErrors.length > 0) {
          const fieldErrors: FormErrors = {};
          error.fieldErrors.forEach((fe) => {
            fieldErrors[fe.field as keyof CandidateInput] = fe.message;
          });
          setErrors(fieldErrors);
        }
        setServerError(error.message);
      } else {
        setServerError('Ocurrió un error inesperado');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="candidate-page">
      <div className="candidate-card">
        <header className="candidate-card__head">
          <span className="candidate-kicker">Reclutamiento</span>
          <h1 className="candidate-title">Añadir candidato</h1>
          <p className="candidate-subtitle">
            Completá los datos del candidato. Los campos marcados con
            <span className="candidate-subtitle__req"> *</span> son obligatorios.
          </p>
        </header>

        {successMessage && (
          <div className="candidate-alert candidate-alert--success" role="status">
            <span className="candidate-alert__dot" aria-hidden="true" />
            {successMessage}
          </div>
        )}
        {serverError && (
          <div className="candidate-alert candidate-alert--error" role="alert">
            <span className="candidate-alert__dot" aria-hidden="true" />
            {serverError}
          </div>
        )}

        <form className="candidate-form" onSubmit={handleSubmit} noValidate>
          <div className="candidate-grid">
            {fields.map(({ name, label, type, required, half }, index) => {
              const fieldError = errors[name];
              const errorId = `${name}-error`;
              return (
                <div
                  className={`candidate-field${half ? '' : ' candidate-field--full'}`}
                  key={name}
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <label htmlFor={name} className="candidate-field__label">
                    <span>{label}</span>
                    {required ? (
                      <span className="candidate-field__req" aria-hidden="true">
                        *
                      </span>
                    ) : (
                      <span className="candidate-field__opt">Opcional</span>
                    )}
                  </label>
                  <input
                    id={name}
                    name={name}
                    type={type || 'text'}
                    value={values[name] ?? ''}
                    onChange={handleChange(name)}
                    disabled={submitting}
                    className={`candidate-input${fieldError ? ' has-error' : ''}`}
                    aria-invalid={fieldError ? true : undefined}
                    aria-describedby={fieldError ? errorId : undefined}
                  />
                  {fieldError && (
                    <span className="candidate-field__error" id={errorId}>
                      {fieldError}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <button
            type="submit"
            className="candidate-submit"
            disabled={submitting}
          >
            {submitting ? 'Guardando…' : 'Añadir candidato'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default AddCandidateForm;
