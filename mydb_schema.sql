--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.4 (Ubuntu 17.4-1.pgdg22.04+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: alert_severities; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.alert_severities AS ENUM (
    'High',
    'Medium',
    'Low'
);


ALTER TYPE public.alert_severities OWNER TO postgres;

--
-- Name: alert_types; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.alert_types AS ENUM (
    'Certification',
    'Document',
    'Info'
);


ALTER TYPE public.alert_types OWNER TO postgres;

--
-- Name: certificate_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.certificate_type_enum AS ENUM (
    'Sustainability Certificate',
    'EAC',
    'Product Certification'
);


ALTER TYPE public.certificate_type_enum OWNER TO postgres;

--
-- Name: certification_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.certification_status AS ENUM (
    'Active',
    'Pending',
    'Expired',
    'Rejected'
);


ALTER TYPE public.certification_status OWNER TO postgres;

--
-- Name: chain_of_custody_model_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.chain_of_custody_model_enum AS ENUM (
    'Mass Balance',
    'Book and claim',
    'na'
);


ALTER TYPE public.chain_of_custody_model_enum OWNER TO postgres;

--
-- Name: document_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.document_type AS ENUM (
    'PPA',
    'POS'
);


ALTER TYPE public.document_type OWNER TO postgres;

--
-- Name: framework_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.framework_enum AS ENUM (
    'Regulatory',
    'Voluntary'
);


ALTER TYPE public.framework_enum OWNER TO postgres;

--
-- Name: geographic_coverage_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.geographic_coverage_enum AS ENUM (
    'National',
    'Regional',
    'Global'
);


ALTER TYPE public.geographic_coverage_enum OWNER TO postgres;

--
-- Name: lifecycle_coverage_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.lifecycle_coverage_enum AS ENUM (
    'well_to_gate',
    'cradle_to_gate',
    'cradle_to_x',
    'full_fuel_chain',
    'cradle_to_grave',
    'full_supply_chain',
    'cradle_to_wheel',
    'well_to_tank',
    'na'
);


ALTER TYPE public.lifecycle_coverage_enum OWNER TO postgres;

--
-- Name: pcf_approach_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.pcf_approach_enum AS ENUM (
    'Monthly',
    'Single',
    'Cumulative',
    'na'
);


ALTER TYPE public.pcf_approach_enum OWNER TO postgres;

--
-- Name: rfnbo_check; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.rfnbo_check AS ENUM (
    'Yes',
    'No'
);


ALTER TYPE public.rfnbo_check OWNER TO postgres;

--
-- Name: role_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.role_enum AS ENUM (
    'Plant Operator',
    'Platform Admin',
    'Compliance Team',
    'Certification Body Agent'
);


ALTER TYPE public.role_enum OWNER TO postgres;

--
-- Name: traceability_method_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.traceability_method_enum AS ENUM (
    'Stakeholders Platform',
    'Sustainability Declarations',
    'sustainability claims',
    'na'
);


ALTER TYPE public.traceability_method_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accreditation_bodies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.accreditation_bodies (
    ab_id integer NOT NULL,
    ab_name character varying(255) NOT NULL
);


ALTER TABLE public.accreditation_bodies OWNER TO postgres;

--
-- Name: accreditation_bodies_ab_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.accreditation_bodies_ab_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.accreditation_bodies_ab_id_seq OWNER TO postgres;

--
-- Name: accreditation_bodies_ab_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.accreditation_bodies_ab_id_seq OWNED BY public.accreditation_bodies.ab_id;


--
-- Name: address; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.address (
    address_id integer NOT NULL,
    street character varying(255),
    city character varying(255),
    state character varying(255),
    postal_code character varying(20),
    country character varying(255),
    region character varying(255)
);


ALTER TABLE public.address OWNER TO postgres;

--
-- Name: address_address_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.address_address_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.address_address_id_seq OWNER TO postgres;

--
-- Name: address_address_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.address_address_id_seq OWNED BY public.address.address_id;


--
-- Name: alert_recipients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alert_recipients (
    alert_id integer NOT NULL,
    user_id integer NOT NULL
);


ALTER TABLE public.alert_recipients OWNER TO postgres;

--
-- Name: alerts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alerts (
    alert_id integer NOT NULL,
    alert_title character varying(100) NOT NULL,
    alert_type public.alert_types,
    issuer_id integer,
    fuel_id integer,
    region_id integer,
    alert_description text,
    alert_severity public.alert_severities,
    "timestamp" timestamp without time zone,
    recipient_id integer
);


ALTER TABLE public.alerts OWNER TO postgres;

--
-- Name: alerts_alert_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.alerts_alert_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.alerts_alert_id_seq OWNER TO postgres;

--
-- Name: alerts_alert_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.alerts_alert_id_seq OWNED BY public.alerts.alert_id;


--
-- Name: certification_bodies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.certification_bodies (
    cb_id integer NOT NULL,
    cb_name character varying(255) NOT NULL
);


ALTER TABLE public.certification_bodies OWNER TO postgres;

--
-- Name: certification_bodies_cb_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.certification_bodies_cb_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.certification_bodies_cb_id_seq OWNER TO postgres;

--
-- Name: certification_bodies_cb_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.certification_bodies_cb_id_seq OWNED BY public.certification_bodies.cb_id;


--
-- Name: certification_scheme_coverage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.certification_scheme_coverage (
    certification_scheme_id integer NOT NULL,
    coverage_id integer NOT NULL
);


ALTER TABLE public.certification_scheme_coverage OWNER TO postgres;

--
-- Name: certification_scheme_feed_stock; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.certification_scheme_feed_stock (
    certification_scheme_id integer NOT NULL,
    feed_stock_id integer NOT NULL
);


ALTER TABLE public.certification_scheme_feed_stock OWNER TO postgres;

--
-- Name: certification_scheme_holders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.certification_scheme_holders (
    csh_id integer NOT NULL,
    csh_name character varying(255) NOT NULL
);


ALTER TABLE public.certification_scheme_holders OWNER TO postgres;

--
-- Name: certification_scheme_holders_csh_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.certification_scheme_holders_csh_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.certification_scheme_holders_csh_id_seq OWNER TO postgres;

--
-- Name: certification_scheme_holders_csh_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.certification_scheme_holders_csh_id_seq OWNED BY public.certification_scheme_holders.csh_id;


--
-- Name: certification_scheme_label; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.certification_scheme_label (
    certification_scheme_id integer NOT NULL,
    label_id integer NOT NULL
);


ALTER TABLE public.certification_scheme_label OWNER TO postgres;

--
-- Name: certification_scheme_standard; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.certification_scheme_standard (
    certification_scheme_id integer NOT NULL,
    standard_id integer NOT NULL
);


ALTER TABLE public.certification_scheme_standard OWNER TO postgres;

--
-- Name: certification_scheme_technology; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.certification_scheme_technology (
    certification_scheme_id integer NOT NULL,
    technology_id integer NOT NULL
);


ALTER TABLE public.certification_scheme_technology OWNER TO postgres;

--
-- Name: certification_schemes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.certification_schemes (
    certification_scheme_id integer NOT NULL,
    certification_scheme_name character varying(255) NOT NULL,
    framework public.framework_enum,
    certificate_type public.certificate_type_enum,
    geographic_coverage public.geographic_coverage_enum,
    accreditation_body_id integer,
    issuing_body_id integer,
    address_id integer,
    overview jsonb,
    validity character varying,
    rfnbo_check public.rfnbo_check,
    lifecycle_coverage public.lifecycle_coverage_enum,
    comparator_value character varying(255),
    ghg_reduction numeric,
    pcf_calculation_methodology character varying(255),
    pcf_approach public.pcf_approach_enum,
    chain_of_custody_model public.chain_of_custody_model_enum,
    traceability_method public.traceability_method_enum,
    blend_ratio real,
    coverage text,
    certification_details jsonb,
    CONSTRAINT check_certification_details_all_fields CHECK (((jsonb_typeof((certification_details -> 'certification_scheme_name'::text)) = 'string'::text) AND (jsonb_typeof((certification_details -> 'validity'::text)) = 'string'::text) AND (jsonb_typeof((certification_details -> 'comparator_value'::text)) = 'string'::text) AND (jsonb_typeof((certification_details -> 'pcf_calculation_methodology'::text)) = 'string'::text) AND (jsonb_typeof((certification_details -> 'ghg_reduction'::text)) = 'number'::text) AND (jsonb_typeof((certification_details -> 'blend_ratio'::text)) = 'number'::text) AND (jsonb_typeof((certification_details -> 'rfnbo_check'::text)) = 'boolean'::text) AND ((certification_details ->> 'framework'::text) = ANY (ARRAY['Regulatory'::text, 'Voluntary'::text])) AND ((certification_details ->> 'certificate_type'::text) = ANY (ARRAY['Sustainability Certificate'::text, 'EAC'::text, 'Product Certification'::text])) AND ((certification_details ->> 'lifecycle_coverage'::text) = ANY (ARRAY['well_to_gate'::text, 'cradle_to_gate'::text, 'cradle_to_x'::text, 'full_fuel_chain'::text, 'cradle_to_grave'::text, 'full_supply_chain'::text, 'cradle_to_wheel'::text, 'well_to_tank'::text, 'na'::text])) AND ((certification_details ->> 'pcf_approach'::text) = ANY (ARRAY['Monthly'::text, 'Single'::text, 'Cumulative'::text, 'na'::text])) AND ((certification_details ->> 'chain_of_custody_model'::text) = ANY (ARRAY['Mass Balance'::text, 'Book and claim'::text, 'na'::text])) AND ((certification_details ->> 'traceability_method'::text) = ANY (ARRAY['Stakeholders Platform'::text, 'Sustainability Declarations'::text, 'sustainability claims'::text, 'na'::text])))),
    CONSTRAINT check_json_keys CHECK (((overview ? 'overview'::text) AND (overview ? 'requirements'::text) AND (overview ? 'process'::text) AND (overview ? 'short_certification_overview'::text) AND (overview ? 'recommendation_overview'::text) AND (overview ? 'track_process'::text))),
    CONSTRAINT check_json_types CHECK (((jsonb_typeof((overview -> 'overview'::text)) = 'object'::text) AND (jsonb_typeof((overview -> 'requirements'::text)) = 'object'::text) AND (jsonb_typeof((overview -> 'process'::text)) = 'object'::text) AND (jsonb_typeof((overview -> 'short_certification_overview'::text)) = 'string'::text) AND (jsonb_typeof((overview -> 'recommendation_overview'::text)) = 'object'::text) AND (jsonb_typeof((overview -> 'track_process'::text)) = 'object'::text) AND (jsonb_typeof(((overview -> 'overview'::text) -> 'description'::text)) = 'string'::text) AND (jsonb_typeof(((overview -> 'overview'::text) -> 'ensure'::text)) = 'object'::text) AND (jsonb_typeof((((overview -> 'overview'::text) -> 'ensure'::text) -> 'title'::text)) = 'string'::text) AND (jsonb_typeof((((overview -> 'overview'::text) -> 'ensure'::text) -> 'list'::text)) = 'array'::text) AND (jsonb_typeof(((overview -> 'overview'::text) -> 'types'::text)) = 'object'::text) AND (jsonb_typeof((((overview -> 'overview'::text) -> 'types'::text) -> 'title'::text)) = 'string'::text) AND (jsonb_typeof((((overview -> 'overview'::text) -> 'types'::text) -> 'types'::text)) = 'array'::text) AND (jsonb_typeof((((((overview -> 'overview'::text) -> 'types'::text) -> 'types'::text) -> 0) -> 'type_title'::text)) = 'string'::text) AND (jsonb_typeof((((((overview -> 'overview'::text) -> 'types'::text) -> 'types'::text) -> 0) -> 'details'::text)) = 'array'::text) AND (jsonb_typeof(((overview -> 'requirements'::text) -> 'description'::text)) = 'string'::text) AND (jsonb_typeof(((overview -> 'requirements'::text) -> 'criteria'::text)) = 'object'::text) AND (jsonb_typeof((((overview -> 'requirements'::text) -> 'criteria'::text) -> 'title'::text)) = 'string'::text) AND (jsonb_typeof((((overview -> 'requirements'::text) -> 'criteria'::text) -> 'criteria_list'::text)) = 'array'::text) AND (jsonb_typeof((((((overview -> 'requirements'::text) -> 'criteria'::text) -> 'criteria_list'::text) -> 0) -> 'criterion_title'::text)) = 'string'::text) AND (jsonb_typeof((((((overview -> 'requirements'::text) -> 'criteria'::text) -> 'criteria_list'::text) -> 0) -> 'details'::text)) = 'array'::text) AND (jsonb_typeof(((overview -> 'requirements'::text) -> 'specific_green'::text)) = 'object'::text) AND (jsonb_typeof((((overview -> 'requirements'::text) -> 'specific_green'::text) -> 'title'::text)) = 'string'::text) AND (jsonb_typeof((((overview -> 'requirements'::text) -> 'specific_green'::text) -> 'description'::text)) = 'string'::text) AND (jsonb_typeof((((overview -> 'requirements'::text) -> 'specific_green'::text) -> 'list'::text)) = 'array'::text) AND (jsonb_typeof(((overview -> 'requirements'::text) -> 'specific_low'::text)) = 'object'::text) AND (jsonb_typeof((((overview -> 'requirements'::text) -> 'specific_low'::text) -> 'title'::text)) = 'string'::text) AND (jsonb_typeof((((overview -> 'requirements'::text) -> 'specific_low'::text) -> 'description'::text)) = 'string'::text) AND (jsonb_typeof((((overview -> 'requirements'::text) -> 'specific_low'::text) -> 'list'::text)) = 'array'::text) AND (jsonb_typeof(((overview -> 'process'::text) -> 'steps'::text)) = 'array'::text) AND (jsonb_typeof(((((overview -> 'track_process'::text) -> 'tasks'::text) -> 0) -> 'task_title'::text)) = 'string'::text) AND (jsonb_typeof(((((overview -> 'track_process'::text) -> 'tasks'::text) -> 0) -> 'sub_task'::text)) = 'array'::text) AND (jsonb_typeof(((overview -> 'recommendation_overview'::text) -> 'description'::text)) = 'string'::text) AND (jsonb_typeof(((overview -> 'recommendation_overview'::text) -> 'features'::text)) = 'array'::text) AND (jsonb_typeof(((overview -> 'track_process'::text) -> 'tasks'::text)) = 'array'::text) AND (jsonb_typeof(((((overview -> 'track_process'::text) -> 'tasks'::text) -> 0) -> 'task_title'::text)) = 'string'::text) AND (jsonb_typeof(((((overview -> 'track_process'::text) -> 'tasks'::text) -> 0) -> 'sub_task'::text)) = 'array'::text)))
);


ALTER TABLE public.certification_schemes OWNER TO postgres;

--
-- Name: COLUMN certification_schemes.blend_ratio; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.certification_schemes.blend_ratio IS 'comment';


--
-- Name: COLUMN certification_schemes.coverage; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.certification_schemes.coverage IS 'Geographic coverage: EU for regional, Global for global';


--
-- Name: certification_schemes_certification_bodies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.certification_schemes_certification_bodies (
    certification_scheme_id integer NOT NULL,
    cb_id integer NOT NULL
);


ALTER TABLE public.certification_schemes_certification_bodies OWNER TO postgres;

--
-- Name: certification_schemes_certification_scheme_holders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.certification_schemes_certification_scheme_holders (
    certification_scheme_id integer NOT NULL,
    csh_id integer NOT NULL
);


ALTER TABLE public.certification_schemes_certification_scheme_holders OWNER TO postgres;

--
-- Name: certification_schemes_certification_scheme_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.certification_schemes_certification_scheme_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.certification_schemes_certification_scheme_id_seq OWNER TO postgres;

--
-- Name: certification_schemes_certification_scheme_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.certification_schemes_certification_scheme_id_seq OWNED BY public.certification_schemes.certification_scheme_id;


--
-- Name: certification_schemes_fuel_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.certification_schemes_fuel_types (
    certification_scheme_id integer NOT NULL,
    fuel_id integer NOT NULL
);


ALTER TABLE public.certification_schemes_fuel_types OWNER TO postgres;

--
-- Name: certification_schemes_issuing_bodies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.certification_schemes_issuing_bodies (
    certification_scheme_id integer NOT NULL,
    ib_id integer NOT NULL
);


ALTER TABLE public.certification_schemes_issuing_bodies OWNER TO postgres;

--
-- Name: certification_schemes_legislation_compliances; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.certification_schemes_legislation_compliances (
    certification_scheme_id integer NOT NULL,
    lc_id integer NOT NULL
);


ALTER TABLE public.certification_schemes_legislation_compliances OWNER TO postgres;

--
-- Name: certifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.certifications (
    certification_id integer NOT NULL,
    plant_id integer,
    certification_scheme_id integer,
    ib_id integer,
    status public.certification_status,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    issue_date date,
    certificate_number character varying(255),
    cb_id integer,
    lc_id integer,
    csh_id integer
);


ALTER TABLE public.certifications OWNER TO postgres;

--
-- Name: certifications_certification_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.certifications_certification_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.certifications_certification_id_seq OWNER TO postgres;

--
-- Name: certifications_certification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.certifications_certification_id_seq OWNED BY public.certifications.certification_id;


--
-- Name: certifications_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.certifications_documents (
    certification_id integer NOT NULL,
    document_id integer NOT NULL
);


ALTER TABLE public.certifications_documents OWNER TO postgres;

--
-- Name: coverage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.coverage (
    coverage_id integer NOT NULL,
    coverage_label character varying(100) NOT NULL,
    countries text[] NOT NULL
);


ALTER TABLE public.coverage OWNER TO postgres;

--
-- Name: coverage_coverage_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.coverage_coverage_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.coverage_coverage_id_seq OWNER TO postgres;

--
-- Name: coverage_coverage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.coverage_coverage_id_seq OWNED BY public.coverage.coverage_id;


--
-- Name: documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.documents (
    document_id integer NOT NULL,
    document_uri text NOT NULL,
    upload_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.documents OWNER TO postgres;

--
-- Name: documents_document_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.documents_document_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.documents_document_id_seq OWNER TO postgres;

--
-- Name: documents_document_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.documents_document_id_seq OWNED BY public.documents.document_id;


--
-- Name: feed_stock; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.feed_stock (
    feed_stock_id integer NOT NULL,
    feed_stock_name character varying(255)
);


ALTER TABLE public.feed_stock OWNER TO postgres;

--
-- Name: feed_stock_feed_stock_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.feed_stock ALTER COLUMN feed_stock_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.feed_stock_feed_stock_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: fuel_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fuel_types (
    fuel_id integer NOT NULL,
    fuel_name character varying(255) NOT NULL,
    fuel_full_name character varying(255)
);


ALTER TABLE public.fuel_types OWNER TO postgres;

--
-- Name: fuel_types_fuel_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.fuel_types_fuel_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.fuel_types_fuel_id_seq OWNER TO postgres;

--
-- Name: fuel_types_fuel_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.fuel_types_fuel_id_seq OWNED BY public.fuel_types.fuel_id;


--
-- Name: issuing_bodies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.issuing_bodies (
    ib_id integer NOT NULL,
    ib_name character varying(255) NOT NULL
);


ALTER TABLE public.issuing_bodies OWNER TO postgres;

--
-- Name: issuing_bodies_ib_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.issuing_bodies_ib_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.issuing_bodies_ib_id_seq OWNER TO postgres;

--
-- Name: issuing_bodies_ib_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.issuing_bodies_ib_id_seq OWNED BY public.issuing_bodies.ib_id;


--
-- Name: label; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.label (
    label_id integer NOT NULL,
    label_name character varying(255)
);


ALTER TABLE public.label OWNER TO postgres;

--
-- Name: label_label_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.label ALTER COLUMN label_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.label_label_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: legislation_compliances; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.legislation_compliances (
    lc_id integer NOT NULL,
    lc_name character varying(255) NOT NULL
);


ALTER TABLE public.legislation_compliances OWNER TO postgres;

--
-- Name: legislation_compliances_lc_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.legislation_compliances_lc_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.legislation_compliances_lc_id_seq OWNER TO postgres;

--
-- Name: legislation_compliances_lc_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.legislation_compliances_lc_id_seq OWNED BY public.legislation_compliances.lc_id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    type character varying(255) NOT NULL,
    message text NOT NULL,
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    read boolean DEFAULT false NOT NULL,
    recipient_id integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: plant_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.plant_documents (
    plant_id integer NOT NULL,
    document_id integer NOT NULL,
    type public.document_type NOT NULL
);


ALTER TABLE public.plant_documents OWNER TO postgres;

--
-- Name: plant_stages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.plant_stages (
    stage_id integer NOT NULL,
    stage_name character varying(255) NOT NULL
);


ALTER TABLE public.plant_stages OWNER TO postgres;

--
-- Name: plant_stages_stage_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.plant_stages_stage_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.plant_stages_stage_id_seq OWNER TO postgres;

--
-- Name: plant_stages_stage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.plant_stages_stage_id_seq OWNED BY public.plant_stages.stage_id;


--
-- Name: plants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.plants (
    plant_id integer NOT NULL,
    plant_name character varying(50) NOT NULL,
    email character varying(100),
    operator_id integer,
    address_id integer,
    fuel_id integer,
    stage_id integer,
    plant_details jsonb,
    CONSTRAINT check_plant_details_keys CHECK (((plant_details ? 'hydrogen'::text) AND (plant_details ? 'ammonia'::text) AND (plant_details ? 'biofuels'::text) AND (plant_details ? 'saf'::text) AND (plant_details ? 'eng'::text) AND (plant_details ? 'methanol'::text) AND (plant_details ? 'electricity'::text) AND (plant_details ? 'water'::text) AND (plant_details ? 'ghg'::text) AND (plant_details ? 'traceability'::text) AND (plant_details ? 'offtakers'::text) AND (plant_details ? 'certifications'::text))),
    CONSTRAINT check_plant_details_types CHECK (((jsonb_typeof(plant_details) = 'object'::text) AND (((plant_details -> 'hydrogen'::text) IS NULL) OR ((jsonb_typeof((plant_details -> 'hydrogen'::text)) = 'object'::text) AND ((((plant_details -> 'hydrogen'::text) -> 'feedstock'::text) IS NULL) OR (jsonb_typeof(((plant_details -> 'hydrogen'::text) -> 'feedstock'::text)) = 'array'::text)) AND ((((plant_details -> 'hydrogen'::text) ->> 'usesCCUS'::text) IS NULL) OR (((plant_details -> 'hydrogen'::text) ->> 'usesCCUS'::text) = ANY (ARRAY['true'::text, 'false'::text]))) AND ((((plant_details -> 'hydrogen'::text) ->> 'isRFNBO'::text) IS NULL) OR (((plant_details -> 'hydrogen'::text) ->> 'isRFNBO'::text) = ANY (ARRAY['true'::text, 'false'::text]))))) AND (((plant_details -> 'ammonia'::text) IS NULL) OR ((jsonb_typeof((plant_details -> 'ammonia'::text)) = 'object'::text) AND ((((plant_details -> 'ammonia'::text) -> 'feedstock'::text) IS NULL) OR (jsonb_typeof(((plant_details -> 'ammonia'::text) -> 'feedstock'::text)) = 'array'::text)) AND ((((plant_details -> 'ammonia'::text) ->> 'usesHaberBosch'::text) IS NULL) OR (((plant_details -> 'ammonia'::text) ->> 'usesHaberBosch'::text) = ANY (ARRAY['true'::text, 'false'::text]))) AND ((((plant_details -> 'ammonia'::text) ->> 'usesCCUS'::text) IS NULL) OR (((plant_details -> 'ammonia'::text) ->> 'usesCCUS'::text) = ANY (ARRAY['true'::text, 'false'::text]))) AND ((((plant_details -> 'ammonia'::text) ->> 'isRFNBO'::text) IS NULL) OR (((plant_details -> 'ammonia'::text) ->> 'isRFNBO'::text) = ANY (ARRAY['true'::text, 'false'::text]))))) AND (((plant_details -> 'biofuels'::text) IS NULL) OR ((jsonb_typeof(((plant_details -> 'biofuels'::text) -> 'biofuels'::text)) = 'array'::text) AND (jsonb_typeof(((plant_details -> 'biofuels'::text) -> 'feedstock'::text)) = 'array'::text) AND ((((plant_details -> 'biofuels'::text) ->> 'isRFNBO'::text) IS NULL) OR (((plant_details -> 'biofuels'::text) ->> 'isRFNBO'::text) = ANY (ARRAY['true'::text, 'false'::text]))))) AND (((plant_details -> 'saf'::text) IS NULL) OR ((jsonb_typeof(((plant_details -> 'saf'::text) -> 'feedstock'::text)) = 'array'::text) AND ((((plant_details -> 'saf'::text) ->> 'isRFNBO'::text) IS NULL) OR (((plant_details -> 'saf'::text) ->> 'isRFNBO'::text) = ANY (ARRAY['true'::text, 'false'::text]))) AND ((((plant_details -> 'saf'::text) ->> 'isGasInjected'::text) IS NULL) OR (((plant_details -> 'saf'::text) ->> 'isGasInjected'::text) = ANY (ARRAY['true'::text, 'false'::text]))) AND ((((plant_details -> 'saf'::text) ->> 'isSAFBlended'::text) IS NULL) OR (((plant_details -> 'saf'::text) ->> 'isSAFBlended'::text) = ANY (ARRAY['true'::text, 'false'::text]))))) AND (((plant_details -> 'eng'::text) IS NULL) OR ((jsonb_typeof(((plant_details -> 'eng'::text) -> 'feedstock'::text)) = 'array'::text) AND ((((plant_details -> 'eng'::text) ->> 'isRFNBO'::text) IS NULL) OR (((plant_details -> 'eng'::text) ->> 'isRFNBO'::text) = ANY (ARRAY['true'::text, 'false'::text]))))) AND (((plant_details -> 'methanol'::text) IS NULL) OR ((jsonb_typeof(((plant_details -> 'methanol'::text) -> 'feedstock'::text)) = 'array'::text) AND ((((plant_details -> 'methanol'::text) ->> 'ccus'::text) IS NULL) OR (((plant_details -> 'methanol'::text) ->> 'ccus'::text) = ANY (ARRAY['true'::text, 'false'::text]))) AND ((((plant_details -> 'methanol'::text) ->> 'ccusPercentage'::text) IS NULL) OR (((plant_details -> 'methanol'::text) ->> 'ccusPercentage'::text) ~ '^\\d{0,3}$'::text)) AND ((((plant_details -> 'methanol'::text) ->> 'isRFNBO'::text) IS NULL) OR (((plant_details -> 'methanol'::text) ->> 'isRFNBO'::text) = ANY (ARRAY['true'::text, 'false'::text]))))) AND (((plant_details -> 'electricity'::text) IS NULL) OR ((jsonb_typeof(((plant_details -> 'electricity'::text) -> 'sources'::text)) = 'array'::text) AND (jsonb_typeof(((plant_details -> 'electricity'::text) -> 'energyMix'::text)) = 'array'::text))) AND (((plant_details -> 'water'::text) IS NULL) OR ((jsonb_typeof(((plant_details -> 'water'::text) -> 'waterSources'::text)) = 'array'::text) AND ((((plant_details -> 'water'::text) ->> 'trackWaterUsage'::text) IS NULL) OR (((plant_details -> 'water'::text) ->> 'trackWaterUsage'::text) = ANY (ARRAY['true'::text, 'false'::text]))))) AND (((plant_details -> 'ghg'::text) IS NULL) OR ((jsonb_typeof(((plant_details -> 'ghg'::text) -> 'methods'::text)) = 'array'::text) AND (jsonb_typeof(((plant_details -> 'ghg'::text) -> 'regulations'::text)) = 'array'::text) AND (jsonb_typeof(((plant_details -> 'ghg'::text) -> 'scopes'::text)) = 'array'::text) AND ((((plant_details -> 'ghg'::text) ->> 'auditorVerified'::text) IS NULL) OR (((plant_details -> 'ghg'::text) ->> 'auditorVerified'::text) = ANY (ARRAY['true'::text, 'false'::text]))))) AND (((plant_details -> 'traceability'::text) IS NULL) OR ((jsonb_typeof(((plant_details -> 'traceability'::text) -> 'chainOfCustody'::text)) = 'array'::text) AND (jsonb_typeof(((plant_details -> 'traceability'::text) -> 'traceabilityLevels'::text)) = 'array'::text) AND ((((plant_details -> 'traceability'::text) ->> 'usesDigitalPlatform'::text) IS NULL) OR (((plant_details -> 'traceability'::text) ->> 'usesDigitalPlatform'::text) = ANY (ARRAY['true'::text, 'false'::text]))))) AND (((plant_details -> 'offtakers'::text) IS NULL) OR ((jsonb_typeof(((plant_details -> 'offtakers'::text) -> 'offTakers'::text)) = 'array'::text) AND ((((plant_details -> 'offtakers'::text) ->> 'requiresLabels'::text) IS NULL) OR (((plant_details -> 'offtakers'::text) ->> 'requiresLabels'::text) = ANY (ARRAY['true'::text, 'false'::text]))))) AND (((plant_details -> 'certifications'::text) IS NULL) OR ((jsonb_typeof(((plant_details -> 'certifications'::text) -> 'selectedSchemes'::text)) = 'array'::text) AND (jsonb_typeof(((plant_details -> 'certifications'::text) -> 'primaryReasons'::text)) = 'array'::text) AND (jsonb_typeof(((plant_details -> 'certifications'::text) -> 'certificationRequirements'::text)) = 'array'::text) AND ((((plant_details -> 'certifications'::text) ->> 'hasBodyCriteria'::text) IS NULL) OR (((plant_details -> 'certifications'::text) ->> 'hasBodyCriteria'::text) = ANY (ARRAY['true'::text, 'false'::text]))) AND ((((plant_details -> 'certifications'::text) ->> 'hasPreferences'::text) IS NULL) OR (((plant_details -> 'certifications'::text) ->> 'hasPreferences'::text) = ANY (ARRAY['true'::text, 'false'::text])))))))
);


ALTER TABLE public.plants OWNER TO postgres;

--
-- Name: plants_plant_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.plants_plant_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.plants_plant_id_seq OWNER TO postgres;

--
-- Name: plants_plant_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.plants_plant_id_seq OWNED BY public.plants.plant_id;


--
-- Name: recommendations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recommendations (
    recommendation_id integer NOT NULL,
    plant_id integer,
    certification_scheme_id integer,
    compliance_score integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    overview jsonb,
    CONSTRAINT check_overview_features_array CHECK ((jsonb_typeof((overview -> 'features'::text)) = 'array'::text)),
    CONSTRAINT check_overview_format CHECK (((overview ? 'title'::text) AND (overview ? 'description'::text) AND (overview ? 'features'::text) AND (overview ? 'certification_entity'::text) AND (overview ? 'validity_months'::text)))
);


ALTER TABLE public.recommendations OWNER TO postgres;

--
-- Name: recommendations_recommendation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.recommendations_recommendation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.recommendations_recommendation_id_seq OWNER TO postgres;

--
-- Name: recommendations_recommendation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.recommendations_recommendation_id_seq OWNED BY public.recommendations.recommendation_id;


--
-- Name: risk_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.risk_profiles (
    risk_profile_id integer NOT NULL,
    plant_id integer,
    risk_score smallint NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.risk_profiles OWNER TO postgres;

--
-- Name: risk_profiles_risk_profile_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.risk_profiles_risk_profile_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.risk_profiles_risk_profile_id_seq OWNER TO postgres;

--
-- Name: risk_profiles_risk_profile_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.risk_profiles_risk_profile_id_seq OWNED BY public.risk_profiles.risk_profile_id;


--
-- Name: standard; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.standard (
    standard_id integer NOT NULL,
    standard_name character varying(255)
);


ALTER TABLE public.standard OWNER TO postgres;

--
-- Name: standards_standard_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.standard ALTER COLUMN standard_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.standards_standard_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: technology; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.technology (
    technology_id integer NOT NULL,
    technology_name character varying(255)
);


ALTER TABLE public.technology OWNER TO postgres;

--
-- Name: technology_technology_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.technology ALTER COLUMN technology_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.technology_technology_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    first_name character varying(50),
    last_name character varying(50),
    email character varying(100) NOT NULL,
    phone_number character(50),
    address_id integer,
    user_role public.role_enum,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "position" character varying(50),
    auth0sub character varying(255),
    company character varying(255)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: accreditation_bodies ab_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accreditation_bodies ALTER COLUMN ab_id SET DEFAULT nextval('public.accreditation_bodies_ab_id_seq'::regclass);


--
-- Name: address address_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.address ALTER COLUMN address_id SET DEFAULT nextval('public.address_address_id_seq'::regclass);


--
-- Name: alerts alert_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alerts ALTER COLUMN alert_id SET DEFAULT nextval('public.alerts_alert_id_seq'::regclass);


--
-- Name: certification_bodies cb_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certification_bodies ALTER COLUMN cb_id SET DEFAULT nextval('public.certification_bodies_cb_id_seq'::regclass);


--
-- Name: certification_scheme_holders csh_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certification_scheme_holders ALTER COLUMN csh_id SET DEFAULT nextval('public.certification_scheme_holders_csh_id_seq'::regclass);


--
-- Name: certification_schemes certification_scheme_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certification_schemes ALTER COLUMN certification_scheme_id SET DEFAULT nextval('public.certification_schemes_certification_scheme_id_seq'::regclass);


--
-- Name: certifications certification_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certifications ALTER COLUMN certification_id SET DEFAULT nextval('public.certifications_certification_id_seq'::regclass);


--
-- Name: coverage coverage_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coverage ALTER COLUMN coverage_id SET DEFAULT nextval('public.coverage_coverage_id_seq'::regclass);


--
-- Name: documents document_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents ALTER COLUMN document_id SET DEFAULT nextval('public.documents_document_id_seq'::regclass);


--
-- Name: fuel_types fuel_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fuel_types ALTER COLUMN fuel_id SET DEFAULT nextval('public.fuel_types_fuel_id_seq'::regclass);


--
-- Name: issuing_bodies ib_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.issuing_bodies ALTER COLUMN ib_id SET DEFAULT nextval('public.issuing_bodies_ib_id_seq'::regclass);


--
-- Name: legislation_compliances lc_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.legislation_compliances ALTER COLUMN lc_id SET DEFAULT nextval('public.legislation_compliances_lc_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: plant_stages stage_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plant_stages ALTER COLUMN stage_id SET DEFAULT nextval('public.plant_stages_stage_id_seq'::regclass);


--
-- Name: plants plant_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plants ALTER COLUMN plant_id SET DEFAULT nextval('public.plants_plant_id_seq'::regclass);


--
-- Name: recommendations recommendation_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recommendations ALTER COLUMN recommendation_id SET DEFAULT nextval('public.recommendations_recommendation_id_seq'::regclass);


--
-- Name: risk_profiles risk_profile_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.risk_profiles ALTER COLUMN risk_profile_id SET DEFAULT nextval('public.risk_profiles_risk_profile_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Name: accreditation_bodies accreditation_bodies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accreditation_bodies
    ADD CONSTRAINT accreditation_bodies_pkey PRIMARY KEY (ab_id);


--
-- Name: address address_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.address
    ADD CONSTRAINT address_pkey PRIMARY KEY (address_id);


--
-- Name: alert_recipients alert_recipients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alert_recipients
    ADD CONSTRAINT alert_recipients_pkey PRIMARY KEY (alert_id, user_id);


--
-- Name: alerts alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT alerts_pkey PRIMARY KEY (alert_id);


--
-- Name: certification_bodies certification_bodies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certification_bodies
    ADD CONSTRAINT certification_bodies_pkey PRIMARY KEY (cb_id);


--
-- Name: certification_scheme_coverage certification_scheme_coverage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certification_scheme_coverage
    ADD CONSTRAINT certification_scheme_coverage_pkey PRIMARY KEY (certification_scheme_id, coverage_id);


--
-- Name: certification_scheme_feed_stock certification_scheme_feed_stock_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certification_scheme_feed_stock
    ADD CONSTRAINT certification_scheme_feed_stock_pkey PRIMARY KEY (certification_scheme_id, feed_stock_id);


--
-- Name: certification_scheme_holders certification_scheme_holders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certification_scheme_holders
    ADD CONSTRAINT certification_scheme_holders_pkey PRIMARY KEY (csh_id);


--
-- Name: certification_scheme_label certification_scheme_label_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certification_scheme_label
    ADD CONSTRAINT certification_scheme_label_pkey PRIMARY KEY (certification_scheme_id, label_id);


--
-- Name: certification_scheme_standard certification_scheme_standard_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certification_scheme_standard
    ADD CONSTRAINT certification_scheme_standard_pkey PRIMARY KEY (certification_scheme_id, standard_id);


--
-- Name: certification_scheme_technology certification_scheme_technology_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certification_scheme_technology
    ADD CONSTRAINT certification_scheme_technology_pkey PRIMARY KEY (certification_scheme_id, technology_id);


--
-- Name: certification_schemes_certification_bodies certification_schemes_certification_bodies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certification_schemes_certification_bodies
    ADD CONSTRAINT certification_schemes_certification_bodies_pkey PRIMARY KEY (certification_scheme_id, cb_id);


--
-- Name: certification_schemes_certification_scheme_holders certification_schemes_certification_scheme_holders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certification_schemes_certification_scheme_holders
    ADD CONSTRAINT certification_schemes_certification_scheme_holders_pkey PRIMARY KEY (certification_scheme_id, csh_id);


--
-- Name: certification_schemes_fuel_types certification_schemes_fuel_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certification_schemes_fuel_types
    ADD CONSTRAINT certification_schemes_fuel_types_pkey PRIMARY KEY (certification_scheme_id, fuel_id);


--
-- Name: certification_schemes_issuing_bodies certification_schemes_issuing_bodies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certification_schemes_issuing_bodies
    ADD CONSTRAINT certification_schemes_issuing_bodies_pkey PRIMARY KEY (certification_scheme_id, ib_id);


--
-- Name: certification_schemes_legislation_compliances certification_schemes_legislation_compliances_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certification_schemes_legislation_compliances
    ADD CONSTRAINT certification_schemes_legislation_compliances_pkey PRIMARY KEY (certification_scheme_id, lc_id);


--
-- Name: certification_schemes certification_schemes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certification_schemes
    ADD CONSTRAINT certification_schemes_pkey PRIMARY KEY (certification_scheme_id);


--
-- Name: certifications_documents certifications_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certifications_documents
    ADD CONSTRAINT certifications_documents_pkey PRIMARY KEY (certification_id, document_id);


--
-- Name: certifications certifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certifications
    ADD CONSTRAINT certifications_pkey PRIMARY KEY (certification_id);


--
-- Name: coverage coverage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coverage
    ADD CONSTRAINT coverage_pkey PRIMARY KEY (coverage_id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (document_id);


--
-- Name: feed_stock feed_stock_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feed_stock
    ADD CONSTRAINT feed_stock_pkey PRIMARY KEY (feed_stock_id);


--
-- Name: fuel_types fuel_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fuel_types
    ADD CONSTRAINT fuel_types_pkey PRIMARY KEY (fuel_id);


--
-- Name: issuing_bodies issuing_bodies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.issuing_bodies
    ADD CONSTRAINT issuing_bodies_pkey PRIMARY KEY (ib_id);


--
-- Name: label label_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.label
    ADD CONSTRAINT label_pkey PRIMARY KEY (label_id);


--
-- Name: legislation_compliances legislation_compliances_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.legislation_compliances
    ADD CONSTRAINT legislation_compliances_pkey PRIMARY KEY (lc_id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: plant_documents plant_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plant_documents
    ADD CONSTRAINT plant_documents_pkey PRIMARY KEY (plant_id, document_id);


--
-- Name: plant_stages plant_stages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plant_stages
    ADD CONSTRAINT plant_stages_pkey PRIMARY KEY (stage_id);


--
-- Name: plants plants_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plants
    ADD CONSTRAINT plants_email_key UNIQUE (email);


--
-- Name: plants plants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plants
    ADD CONSTRAINT plants_pkey PRIMARY KEY (plant_id);


--
-- Name: recommendations recommendations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recommendations
    ADD CONSTRAINT recommendations_pkey PRIMARY KEY (recommendation_id);


--
-- Name: risk_profiles risk_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.risk_profiles
    ADD CONSTRAINT risk_profiles_pkey PRIMARY KEY (risk_profile_id);


--
-- Name: standard standards_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.standard
    ADD CONSTRAINT standards_pkey PRIMARY KEY (standard_id);


--
-- Name: technology technology_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.technology
    ADD CONSTRAINT technology_pkey PRIMARY KEY (technology_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_phone_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_number_key UNIQUE (phone_number);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: alert_recipients alert_recipients_alert_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alert_recipients
    ADD CONSTRAINT alert_recipients_alert_id_fkey FOREIGN KEY (alert_id) REFERENCES public.alerts(alert_id) ON DELETE CASCADE;


--
-- Name: alert_recipients alert_recipients_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alert_recipients
    ADD CONSTRAINT alert_recipients_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: certification_scheme_coverage certification_scheme_coverage_certification_scheme_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certification_scheme_coverage
    ADD CONSTRAINT certification_scheme_coverage_certification_scheme_id_fkey FOREIGN KEY (certification_scheme_id) REFERENCES public.certification_schemes(certification_scheme_id);


--
-- Name: certification_scheme_coverage certification_scheme_coverage_coverage_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certification_scheme_coverage
    ADD CONSTRAINT certification_scheme_coverage_coverage_id_fkey FOREIGN KEY (coverage_id) REFERENCES public.coverage(coverage_id);


--
-- Name: certification_schemes fk_accreditation_body; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certification_schemes
    ADD CONSTRAINT fk_accreditation_body FOREIGN KEY (accreditation_body_id) REFERENCES public.accreditation_bodies(ab_id);


--
-- Name: users fk_address; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_address FOREIGN KEY (address_id) REFERENCES public.address(address_id);


--
-- Name: plants fk_address; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plants
    ADD CONSTRAINT fk_address FOREIGN KEY (address_id) REFERENCES public.address(address_id);


--
-- Name: certification_schemes fk_address; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certification_schemes
    ADD CONSTRAINT fk_address FOREIGN KEY (address_id) REFERENCES public.address(address_id);


--
-- Name: certifications_documents fk_ceritication; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certifications_documents
    ADD CONSTRAINT fk_ceritication FOREIGN KEY (certification_id) REFERENCES public.certifications(certification_id);


--
-- Name: certification_schemes_certification_bodies fk_certification_body; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certification_schemes_certification_bodies
    ADD CONSTRAINT fk_certification_body FOREIGN KEY (cb_id) REFERENCES public.certification_bodies(cb_id);


--
-- Name: certifications fk_certification_scheme; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certifications
    ADD CONSTRAINT fk_certification_scheme FOREIGN KEY (certification_scheme_id) REFERENCES public.certification_schemes(certification_scheme_id) ON DELETE CASCADE;


--
-- Name: certification_schemes_fuel_types fk_certification_scheme; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certification_schemes_fuel_types
    ADD CONSTRAINT fk_certification_scheme FOREIGN KEY (certification_scheme_id) REFERENCES public.certification_schemes(certification_scheme_id) ON DELETE CASCADE;


--
-- Name: certification_schemes_legislation_compliances fk_certification_scheme; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certification_schemes_legislation_compliances
    ADD CONSTRAINT fk_certification_scheme FOREIGN KEY (certification_scheme_id) REFERENCES public.certification_schemes(certification_scheme_id) ON DELETE CASCADE;


--
-- Name: certification_schemes_certification_scheme_holders fk_certification_scheme; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certification_schemes_certification_scheme_holders
    ADD CONSTRAINT fk_certification_scheme FOREIGN KEY (certification_scheme_id) REFERENCES public.certification_schemes(certification_scheme_id) ON DELETE CASCADE;


--
-- Name: certification_schemes_certification_bodies fk_certification_scheme; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certification_schemes_certification_bodies
    ADD CONSTRAINT fk_certification_scheme FOREIGN KEY (certification_scheme_id) REFERENCES public.certification_schemes(certification_scheme_id) ON DELETE CASCADE;


--
-- Name: recommendations fk_certification_scheme; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recommendations
    ADD CONSTRAINT fk_certification_scheme FOREIGN KEY (certification_scheme_id) REFERENCES public.certification_schemes(certification_scheme_id) ON DELETE CASCADE;


--
-- Name: certification_scheme_feed_stock fk_certification_scheme; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certification_scheme_feed_stock
    ADD CONSTRAINT fk_certification_scheme FOREIGN KEY (certification_scheme_id) REFERENCES public.certification_schemes(certification_scheme_id) ON DELETE CASCADE;


--
-- Name: certification_scheme_label fk_certification_scheme; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certification_scheme_label
    ADD CONSTRAINT fk_certification_scheme FOREIGN KEY (certification_scheme_id) REFERENCES public.certification_schemes(certification_scheme_id) ON DELETE CASCADE;


--
-- Name: certification_scheme_technology fk_certification_scheme; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certification_scheme_technology
    ADD CONSTRAINT fk_certification_scheme FOREIGN KEY (certification_scheme_id) REFERENCES public.certification_schemes(certification_scheme_id) ON DELETE CASCADE;


--
-- Name: certification_scheme_standard fk_certification_scheme; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certification_scheme_standard
    ADD CONSTRAINT fk_certification_scheme FOREIGN KEY (certification_scheme_id) REFERENCES public.certification_schemes(certification_scheme_id);


--
-- Name: certification_schemes_issuing_bodies fk_certification_scheme; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certification_schemes_issuing_bodies
    ADD CONSTRAINT fk_certification_scheme FOREIGN KEY (certification_scheme_id) REFERENCES public.certification_schemes(certification_scheme_id);


--
-- Name: certification_schemes_certification_scheme_holders fk_certification_scheme_holder; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certification_schemes_certification_scheme_holders
    ADD CONSTRAINT fk_certification_scheme_holder FOREIGN KEY (csh_id) REFERENCES public.certification_scheme_holders(csh_id);


--
-- Name: certifications_documents fk_document; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certifications_documents
    ADD CONSTRAINT fk_document FOREIGN KEY (document_id) REFERENCES public.documents(document_id);


--
-- Name: certification_scheme_feed_stock fk_feed_stock; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certification_scheme_feed_stock
    ADD CONSTRAINT fk_feed_stock FOREIGN KEY (feed_stock_id) REFERENCES public.feed_stock(feed_stock_id) ON DELETE CASCADE;


--
-- Name: alerts fk_fuel; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT fk_fuel FOREIGN KEY (fuel_id) REFERENCES public.fuel_types(fuel_id);


--
-- Name: plants fk_fuel_type; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plants
    ADD CONSTRAINT fk_fuel_type FOREIGN KEY (fuel_id) REFERENCES public.fuel_types(fuel_id);


--
-- Name: certification_schemes_fuel_types fk_fuel_type; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certification_schemes_fuel_types
    ADD CONSTRAINT fk_fuel_type FOREIGN KEY (fuel_id) REFERENCES public.fuel_types(fuel_id) ON DELETE CASCADE;


--
-- Name: certifications fk_ib; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certifications
    ADD CONSTRAINT fk_ib FOREIGN KEY (ib_id) REFERENCES public.issuing_bodies(ib_id);


--
-- Name: alerts fk_issuer; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT fk_issuer FOREIGN KEY (issuer_id) REFERENCES public.users(user_id);


--
-- Name: certification_schemes fk_issuing_body; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certification_schemes
    ADD CONSTRAINT fk_issuing_body FOREIGN KEY (issuing_body_id) REFERENCES public.issuing_bodies(ib_id);


--
-- Name: certification_schemes_issuing_bodies fk_issuing_body; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certification_schemes_issuing_bodies
    ADD CONSTRAINT fk_issuing_body FOREIGN KEY (ib_id) REFERENCES public.issuing_bodies(ib_id);


--
-- Name: certification_scheme_label fk_label; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certification_scheme_label
    ADD CONSTRAINT fk_label FOREIGN KEY (label_id) REFERENCES public.label(label_id) ON DELETE CASCADE;


--
-- Name: certification_schemes_legislation_compliances fk_legislation_compliance; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certification_schemes_legislation_compliances
    ADD CONSTRAINT fk_legislation_compliance FOREIGN KEY (lc_id) REFERENCES public.legislation_compliances(lc_id);


--
-- Name: plants fk_operator; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plants
    ADD CONSTRAINT fk_operator FOREIGN KEY (operator_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: certifications fk_plant; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certifications
    ADD CONSTRAINT fk_plant FOREIGN KEY (plant_id) REFERENCES public.plants(plant_id) ON DELETE CASCADE;


--
-- Name: recommendations fk_plant; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recommendations
    ADD CONSTRAINT fk_plant FOREIGN KEY (plant_id) REFERENCES public.plants(plant_id) ON DELETE CASCADE;


--
-- Name: alerts fk_region; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT fk_region FOREIGN KEY (region_id) REFERENCES public.address(address_id);


--
-- Name: certification_scheme_standard fk_standard; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certification_scheme_standard
    ADD CONSTRAINT fk_standard FOREIGN KEY (standard_id) REFERENCES public.standard(standard_id);


--
-- Name: certification_scheme_technology fk_technology; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certification_scheme_technology
    ADD CONSTRAINT fk_technology FOREIGN KEY (technology_id) REFERENCES public.technology(technology_id) ON DELETE CASCADE;


--
-- Name: plant_documents plant_documents_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plant_documents
    ADD CONSTRAINT plant_documents_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(document_id) ON DELETE CASCADE;


--
-- Name: plant_documents plant_documents_plant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plant_documents
    ADD CONSTRAINT plant_documents_plant_id_fkey FOREIGN KEY (plant_id) REFERENCES public.plants(plant_id) ON DELETE CASCADE;


--
-- Name: plants plants_stage_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plants
    ADD CONSTRAINT plants_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES public.plant_stages(stage_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

