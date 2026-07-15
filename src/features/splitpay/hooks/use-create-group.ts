"use client"

import { useState, useCallback } from "react"
import {
  DEFAULT_EMOJI,
  DEFAULT_SPLIT,
  DEFAULT_CURRENCY,
  MAX_DESC_LENGTH,
} from "../mock/create-group-data"
import type {
  CreateGroupForm,
  CreateGroupFormErrors,
  SelectedMember,
  SplitTypeId,
  CreateGroupStatus,
} from "../types/create-group"
import type { CurrencyCode } from "@/src/config/constants"

// ─── Initial State ────────────────────────────────────────────────────────────

const INITIAL_FORM: CreateGroupForm = {
  emoji:       DEFAULT_EMOJI,
  name:        "",
  description: "",
  members:     [],
  splitType:   DEFAULT_SPLIT,
  currency:    DEFAULT_CURRENCY,
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCreateGroupForm() {
  const [form,   setForm]   = useState<CreateGroupForm>(INITIAL_FORM)
  const [errors, setErrors] = useState<CreateGroupFormErrors>({})
  const [status, setStatus] = useState<CreateGroupStatus>("idle")
  const [shakeField, setShakeField] = useState<keyof CreateGroupForm | null>(null)

  // ── Field setters ──────────────────────────────────────────────────────────

  const setEmoji = useCallback((emoji: string) => {
    setForm((f) => ({ ...f, emoji }))
    setErrors((e) => ({ ...e, emoji: undefined }))
  }, [])

  const setName = useCallback((name: string) => {
    setForm((f) => ({ ...f, name }))
    if (errors.name) setErrors((e) => ({ ...e, name: undefined }))
  }, [errors.name])

  const setDescription = useCallback((description: string) => {
    if (description.length > MAX_DESC_LENGTH) return
    setForm((f) => ({ ...f, description }))
  }, [])

  const addMember = useCallback((member: SelectedMember) => {
    setForm((f) => {
      if (f.members.find((m) => m.id === member.id)) return f
      return { ...f, members: [...f.members, member] }
    })
    setErrors((e) => ({ ...e, members: undefined }))
  }, [])

  const removeMember = useCallback((id: string) => {
    setForm((f) => ({ ...f, members: f.members.filter((m) => m.id !== id) }))
  }, [])

  const setSplitType = useCallback((splitType: SplitTypeId) => {
    setForm((f) => ({ ...f, splitType }))
  }, [])

  const setCurrency = useCallback((currency: CurrencyCode) => {
    setForm((f) => ({ ...f, currency }))
  }, [])

  // ── Validation ────────────────────────────────────────────────────────────

  const validate = useCallback((): boolean => {
    const newErrors: CreateGroupFormErrors = {}

    if (!form.name.trim()) {
      newErrors.name = "Group name is required"
      setShakeField("name")
      setTimeout(() => setShakeField(null), 500)
    }

    if (form.members.length === 0) {
      newErrors.members = "Add at least one member"
      setShakeField("members")
      setTimeout(() => setShakeField(null), 500)
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [form])

  // ── Submit ────────────────────────────────────────────────────────────────

  const submit = useCallback(async (): Promise<boolean> => {
    if (!validate()) return false

    setStatus("loading")

    // Simulate API call — replace with real mutation
    await new Promise((resolve) => setTimeout(resolve, 1400))

    setStatus("success")
    return true
  }, [validate])

  const reset = useCallback(() => {
    setForm(INITIAL_FORM)
    setErrors({})
    setStatus("idle")
    setShakeField(null)
  }, [])

  return {
    form,
    errors,
    status,
    shakeField,
    // Setters
    setEmoji,
    setName,
    setDescription,
    addMember,
    removeMember,
    setSplitType,
    setCurrency,
    // Actions
    submit,
    reset,
    // Computed
    isLoading:  status === "loading",
    isSuccess:  status === "success",
    isValid:    !errors.name && !errors.members,
    charCount:  form.description.length,
    memberCount:form.members.length,
  }
}