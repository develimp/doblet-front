<script setup>
import { ref, computed, watch } from 'vue';
import { Notify } from 'quasar';
import { api } from 'boot/axios';
import SpSelect from 'src/components/SpSelect.vue';
import { useFetch } from 'src/composables/useFetch';

const selectedMember = ref(null);
const selectedFamily = ref(null);

const {
  data: members,
  loading: loadingMembers,
  error: errorMembers,
  refetch: refetchMembers,
} = useFetch('/members', {
  params: {
    filter: {
      order: ['surname ASC'],
    },
  },
})

const memberLabel = (member) => {
  if (!member) return ''
  return `${member.name} ${member.surname}`
}

const familyMembers = computed(() => {
  if (!selectedMember.value || !members.value?.length) return []

  const selected = members.value.find((m) => m.id === selectedMember.value)
  if (!selected?.familyFk) return []

  return members.value.filter(
    (m) => m.familyFk === selected.familyFk && m.id !== selectedMember.value,
  )
})

const selectedMemberDetails = computed(() => {
  if (!selectedMember.value || !members.value?.length) return null
  return members.value.find((m) => m.id === selectedMember.value) || null
})

const memberStatusLabel = computed(() => {
  if (!selectedMemberDetails.value) return ''
  return selectedMemberDetails.value.isRegistered ? 'Membre actiu' : 'Membre inactiu'
})

const memberStatusColor = computed(() => {
  if (!selectedMemberDetails.value) return 'grey'
  return selectedMemberDetails.value.isRegistered ? 'positive' : 'negative'
})

const registrationActionLabel = computed(() => {
  if (!selectedMemberDetails.value) return ''
  return selectedMemberDetails.value.isRegistered ? "Donar de baixa" : "Donar d'alta"
})

const registrationActionColor = computed(() => {
  if (!selectedMemberDetails.value) return 'secondary'
  return selectedMemberDetails.value.isRegistered ? 'negative' : 'positive'
})

const memberForm = ref({
  name: null,
  surname: null,
  birthdate: null,
  dni: null,
  address: null,
  phone: null,
  email: null,
})

const popupBirthdateRef = ref(null)

const formatIsoToDate = (isoStr) => {
  if (!isoStr) return ''
  return isoStr.split('T')[0]
}

const populateMemberForm = () => {
  const selected = members.value.find((m) => m.id === selectedMember.value)
  if (!selected) {
    memberForm.value = {
      name: null,
      surname: null,
      birthdate: null,
      dni: null,
      address: null,
      phone: null,
      email: null,
    }
    return
  }

  memberForm.value = {
    name: selected.name || null,
    surname: selected.surname || null,
    birthdate: formatIsoToDate(selected.birthdate),
    dni: selected.dni || selected.nif || null,
    address: selected.address || null,
    phone: selected.phone || selected.phoneNumber || null,
    email: selected.email || null,
  }
}

watch([selectedMember, members], populateMemberForm, { immediate: true })

const isUpdating = ref(false)

const toIsoMidnightUTC = (ymd) => {
  if (!ymd || ymd === '') return null
  const [y, m, d] = ymd.split(/[-/]/).map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toISOString()
}

const updateMember = async () => {
  if (!selectedMember.value) return

  const payload = {
    name: memberForm.value.name,
    surname: memberForm.value.surname,
  }

  if (memberForm.value.birthdate) {
    payload.birthdate = toIsoMidnightUTC(memberForm.value.birthdate)
  }
  if (memberForm.value.dni != null && memberForm.value.dni !== '') {
    payload.dni = memberForm.value.dni
  }
  if (memberForm.value.address != null && memberForm.value.address !== '') {
    payload.address = memberForm.value.address
  }
  if (memberForm.value.phone != null && memberForm.value.phone !== '') {
    payload.phoneNumber = memberForm.value.phone
  }
  if (memberForm.value.email != null && memberForm.value.email !== '') {
    payload.email = memberForm.value.email
  }

  isUpdating.value = true

  try {
    await api.patch(`/members/${selectedMember.value}`, payload)
    Notify.create({
      type: 'positive',
      message: 'Dades actualitzades correctament',
    })
    await refetchMembers()
  } catch (err) {
    Notify.create({
      type: 'negative',
      message: 'Error actualitzant dades',
      caption: err?.message || String(err),
    })
  } finally {
    isUpdating.value = false
  }
}

const toggleRegistration = async () => {
  if (!selectedMember.value || !selectedMemberDetails.value) return

  const payload = {
    isRegistered: !selectedMemberDetails.value.isRegistered,
  }

  try {
    await api.patch(`/members/${selectedMember.value}`, payload)
    Notify.create({
      type: 'positive',
      message: selectedMemberDetails.value.isRegistered
        ? 'Membre donat de baixa'
        : 'Membre donat d\'alta',
    })
    await refetchMembers()
  } catch (err) {
    Notify.create({
      type: 'negative',
      message: 'Error actualitzant l\'estat del membre',
      caption: err?.message || String(err),
    })
  }
}

const FAMILY_NEW_OPTION = 'new-family'
const showFamilyChangeDialog = ref(false)
const selectedFamilyTarget = ref(null)

const showNewMemberDialog = ref(false)
const isCreating = ref(false)
const selectedNewMemberTarget = ref(null)
const newMemberForm = ref({
  name: null,
  surname: null,
  birthdate: null,
  gender: 'M',
  dni: null,
  address: null,
  phone: null,
  email: null,
  familyFk: null,
})
const popupNewBirthdateRef = ref(null)

const resetNewMemberForm = () => {
  selectedNewMemberTarget.value = null
  newMemberForm.value = {
    name: null,
    surname: null,
    birthdate: null,
    gender: 'M',
    dni: null,
    address: null,
    phone: null,
    email: null,
    familyFk: null,
  }
}

const openNewMemberDialog = () => {
  resetNewMemberForm()
  selectedNewMemberTarget.value = null
  showNewMemberDialog.value = true
}

const memberOptions = computed(() => {
  if (!members.value?.length) return []
  const options = members.value.map((m) => ({
    label: memberLabel(m),
    value: m.id,
  }))
  return [{ label: 'Familia nova', value: FAMILY_NEW_OPTION }, ...options]
})

watch(selectedNewMemberTarget, (val) => {
  if (!val || val === FAMILY_NEW_OPTION || !members.value?.length) {
    newMemberForm.value.familyFk = null
    return
  }
  const member = members.value.find((m) => m.id === val)
  newMemberForm.value.familyFk = member?.familyFk || null
})

const createNewMember = async () => {
  isCreating.value = true

  try {
    let familyFk = newMemberForm.value.familyFk

    if (selectedNewMemberTarget.value === FAMILY_NEW_OPTION) {
      const familyResponse = await api.post('/families', { discount: 0 })
      familyFk = familyResponse?.data?.id
    }

    const payload = {
      name: newMemberForm.value.name,
      surname: newMemberForm.value.surname,
      familyFk: familyFk,
      isRegistered: true,
    }

    if (newMemberForm.value.birthdate) {
      payload.birthdate = toIsoMidnightUTC(newMemberForm.value.birthdate)
    }
    if (newMemberForm.value.gender) {
      payload.gender = newMemberForm.value.gender
    }
    if (newMemberForm.value.dni != null && newMemberForm.value.dni !== '') {
      payload.dni = newMemberForm.value.dni
    }
    if (newMemberForm.value.address != null && newMemberForm.value.address !== '') {
      payload.address = newMemberForm.value.address
    }
    if (newMemberForm.value.phone != null && newMemberForm.value.phone !== '') {
      payload.phoneNumber = newMemberForm.value.phone
    }
    if (newMemberForm.value.email != null && newMemberForm.value.email !== '') {
      payload.email = newMemberForm.value.email
    }

    const response = await api.post('/members', payload)

    Notify.create({
      type: 'positive',
      message: 'Membre creat correctament',
    })

    await refetchMembers()
    if (response?.data?.id) {
      selectedMember.value = response.data.id
    }
    showNewMemberDialog.value = false
  } catch (err) {
    Notify.create({
      type: 'negative',
      message: 'Error creant el membre',
      caption: err?.message || String(err),
    })
  } finally {
    isCreating.value = false
  }
}

const familyChangeOptions = computed(() => {
  if (!members.value?.length || !selectedMember.value) return []

  const currentFamilyFk = selectedMemberDetails.value?.familyFk
  const otherMembers = members.value
    .filter((m) => m.id !== selectedMember.value && m.familyFk !== currentFamilyFk)
    .map((m) => ({
      label: memberLabel(m),
      value: m.id,
    }))

  const hasCurrentFamilyMembers = members.value.some(
    (m) => m.id !== selectedMember.value && m.familyFk && m.familyFk === currentFamilyFk,
  )

  const base = hasCurrentFamilyMembers ? [{ label: 'Familia nova', value: FAMILY_NEW_OPTION }] : []

  return [...base, ...otherMembers]
})

const openFamilyChangeDialog = () => {
  if (!selectedMember.value) return
  selectedFamilyTarget.value = null
  showFamilyChangeDialog.value = true
}

const changeFamily = async () => {
  if (!selectedMember.value || !selectedFamilyTarget.value) return

  isUpdating.value = true

  try {
    if (selectedFamilyTarget.value === FAMILY_NEW_OPTION) {
      await api.post(`/members/${selectedMember.value}/leave-family`)
      Notify.create({
        type: 'positive',
        message: 'Ha eixit de la família',
      })
    } else {
      const targetMember = members.value.find((m) => m.id === selectedFamilyTarget.value)
      if (!targetMember?.familyFk) {
        throw new Error('No es pot determinar la familia del membre seleccionat')
      }

      await api.patch(`/members/${selectedMember.value}`, {
        familyFk: targetMember.familyFk,
      })
      Notify.create({
        type: 'positive',
        message: 'Familia canviada correctament',
      })
    }

    showFamilyChangeDialog.value = false
    await refetchMembers()
  } catch (err) {
    Notify.create({
      type: 'negative',
      message: 'Error canviant la família',
      caption: err?.message || String(err),
    })
  } finally {
    isUpdating.value = false
  }
}

const selectFamily = (val) => {
  if (!val || val === selectedMember.value) return

  selectedFamily.value = null
  selectedMember.value = val
}

watch(errorMembers, (err) => {
  if (err) {
    Notify.create({
      type: 'negative',
      message: 'Error carregant membres',
      caption: err.message,
    })
  }
})

</script>

<template>
  <q-page padding>
    <div class="row justify-center items-center q-gutter-md q-mb-md">
      <div class="col-auto">
        <SpSelect
          v-model="selectedMember"
          :options="members"
          :loading="loadingMembers"
          :option-label="memberLabel"
          option-value="id"
          label="Membre"
        />
      </div>

      <div class="col-auto">
        <SpSelect
          :model-value="selectedFamily"
          :options="familyMembers"
          :loading="loadingMembers"
          :option-label="memberLabel"
          option-value="id"
          label="Familiar"
          :disable="!selectedMember"
          @update:model-value="selectFamily"
        />
      </div>

      <div class="col-auto">
        <q-btn
          label="Alta nova"
          color="primary"
          @click="openNewMemberDialog"
        />
      </div>
    </div>

    <q-dialog v-model="showNewMemberDialog" persistent>
      <q-card style="min-width: 360px; max-width: 520px;">
        <q-card-section>
          <div class="text-h6">Alta nova</div>
          <div class="q-pa-md">
            <div class="row q-col-gutter-md q-row-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="newMemberForm.name"
                  label="Nom"
                  outlined
                  dense
                />
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model="newMemberForm.surname"
                  label="Cognoms"
                  outlined
                  dense
                />
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  outlined
                  v-model="newMemberForm.birthdate"
                  label="Data de naixement"
                  class="cursor-pointer"
                  readonly
                  @click="popupNewBirthdateRef?.value?.show?.()"
                  dense
                >
                  <template v-slot:append>
                    <q-icon
                      name="event"
                      class="cursor-pointer"
                      @click="popupNewBirthdateRef?.value?.show?.()"
                    />
                  </template>

                  <q-popup-proxy
                    ref="popupNewBirthdateRef"
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date
                      v-model="newMemberForm.birthdate"
                      @update:model-value="popupNewBirthdateRef.hide()"
                      color="primary"
                    />
                  </q-popup-proxy>
                </q-input>
              </div>

              <div class="col-12 col-md-6 q-mt-sm gender-checkboxes">
                <div class="row q-gutter-md items-center">
                  <q-checkbox
                    :model-value="newMemberForm.gender === 'M'"
                    @update:model-value="(val) => newMemberForm.gender = val ? 'M' : null"
                    label="M"
                    dense
                  />
                  <q-checkbox
                    :model-value="newMemberForm.gender === 'F'"
                    @update:model-value="(val) => newMemberForm.gender = val ? 'F' : null"
                    label="F"
                    dense
                  />
                </div>
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model="newMemberForm.dni"
                  label="Dni"
                  outlined
                  dense
                />
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model="newMemberForm.address"
                  label="Adreça"
                  outlined
                  dense
                />
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model="newMemberForm.phone"
                  label="Telèfon"
                  outlined
                  dense
                />
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model="newMemberForm.email"
                  label="Email"
                  type="email"
                  outlined
                  dense
                />
              </div>

              <div class="col-12">
                <SpSelect
                  v-model="selectedNewMemberTarget"
                  :options="memberOptions"
                  :loading="loadingMembers"
                  label="Selecciona un membre de la família"
                  emit-value
                  map-options
                  option-label="label"
                  option-value="value"
                />
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel·lar" @click="showNewMemberDialog = false" text-color="primary" :disable="isCreating" />
          <q-btn
            label="Guardar"
            color="primary"
            @click="createNewMember"
            :loading="isCreating"
            :disable="isCreating || !newMemberForm.name || !newMemberForm.surname || !newMemberForm.birthdate || (!newMemberForm.familyFk && selectedNewMemberTarget !== FAMILY_NEW_OPTION)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <div v-if="selectedMember" class="q-mt-lg q-pa-md">
      <q-card flat bordered>
        <q-card-section class="row items-center q-gutter-sm">
          <div class="col">
            <div class="text-orange text-bold">Dades bàsiques del membre</div>
          </div>
          <div class="col-auto">
            <q-chip
              :color="memberStatusColor"
              text-color="white"
              dense
              outline
            >
              {{ memberStatusLabel }}
            </q-chip>
          </div>
          <div class="col-auto">
            <q-btn
              :label="registrationActionLabel"
              :color="registrationActionColor"
              dense
              @click="toggleRegistration"
              :disable="!selectedMember"
            />
          </div>
        </q-card-section>
        <q-separator />

        <div class="q-pa-md">
          <div class="row q-col-gutter-md q-row-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="memberForm.name"
                label="Nom"
                outlined
                dense
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="memberForm.surname"
                label="Cognoms"
                outlined
                dense
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                outlined
                v-model="memberForm.birthdate"
                label="Data de naixement"
                class="cursor-pointer"
                readonly
                @click="popupBirthdateRef?.value?.show?.()"
                dense
              >
                <template v-slot:append>
                  <q-icon
                    name="event"
                    class="cursor-pointer"
                    @click="popupBirthdateRef?.value?.show?.()"
                  />
                </template>

                <q-popup-proxy
                  ref="popupBirthdateRef"
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date
                    v-model="memberForm.birthdate"
                    @update:model-value="popupBirthdateRef.hide()"
                    color="primary"
                  />
                </q-popup-proxy>
              </q-input>
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="memberForm.dni"
                label="Dni"
                outlined
                dense
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="memberForm.address"
                label="Adreça"
                outlined
                dense
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="memberForm.phone"
                label="Telèfon"
                outlined
                dense
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="memberForm.email"
                label="Email"
                type="email"
                outlined
                dense
              />
            </div>
          </div>

          <div class="row justify-end q-mt-md">
            <div class="col-auto row items-center q-gutter-sm">
              <q-btn
                label="Canviar familia"
                color="secondary"
                @click="openFamilyChangeDialog"
                :disable="!selectedMember || isUpdating"
              />
              <q-btn
                label="Actualitzar"
                color="primary"
                @click="updateMember"
                :disable="!selectedMember || isUpdating"
                :loading="isUpdating"
              />
            </div>
          </div>
        </div>
      </q-card>

      <q-dialog v-model="showFamilyChangeDialog" persistent>
        <q-card style="min-width: 360px; max-width: 520px;">
          <q-card-section>
            <div class="text-h6">Canviar família</div>
            <div class="text-subtitle2 q-mt-sm">Membres actuals de la família</div>
            <div v-if="familyMembers.length" class="q-mt-sm">
              <div
                v-for="member in familyMembers"
                :key="member.id"
                class="q-pa-xs"
              >
                {{ memberLabel(member) }}
              </div>
            </div>
            <div v-else class="text-caption q-mt-sm">
              No hi ha membres actuals de la família
            </div>

              <SpSelect
                v-model="selectedFamilyTarget"
                :options="familyChangeOptions"
                label="Selecciona un membre de la família nova"
                class="q-mt-md"
                emit-value
                map-options
                option-label="label"
                option-value="value"
              />
          </q-card-section>

          <q-separator />

          <q-card-actions align="right">
            <q-btn flat label="Cancel·lar" @click="showFamilyChangeDialog = false" />
            <q-btn
              label="Canviar"
              color="primary"
              @click="changeFamily"
              :disable="!selectedFamilyTarget || isUpdating"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<style scoped>
.gender-checkboxes :deep(.q-checkbox__label) {
  color: grey;
}
</style>