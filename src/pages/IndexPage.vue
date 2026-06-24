<script setup>
import { api } from 'boot/axios'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentFallaYear = ref(null)
const confirmChange = ref(false)

const goTo = (route) => {
  router.push(`/${route}`)
}

const onChangeYear = () => {
  confirmChange.value = true
}

const confirmChangeYear = async () => {
  try {
    await api.post('/falla-years/change-year')

    const { data } = await api.get('/falla-years/current')
    currentFallaYear.value = data.code
  } catch (error) {
    console.error(error)
  }
}

const downloadAdherencePdf = async () => {
  try {
    const response = await api.get('/members/adherence-pdf', {
      responseType: 'blob',
    })

    const url = window.URL.createObjectURL(
      new Blob([response.data], { type: 'application/pdf' })
    )

    window.open(url)
  } catch (error) {
    console.error('Error descargando PDF:', error)
  }
}

const downloadAuthorizationPdf = async () => {
  try {
    const response = await api.get('/members/authorization-pdf', {
      responseType: 'blob',
    })

    const url = window.URL.createObjectURL(
      new Blob([response.data], { type: 'application/pdf' })
    )

    window.open(url)
  } catch (error) {
    console.error('Error descargando PDF:', error)
  }
}

const downloadPartnerPdf = async () => {
  try {
    const response = await api.get('/members/partner-pdf', {
      responseType: 'blob',
    })

    const url = window.URL.createObjectURL(
      new Blob([response.data], { type: 'application/pdf' })
    )

    window.open(url)
  } catch (error) {
    console.error('Error descargando PDF:', error)
  }
}

const openGrafana = () => {
  window.open('https://grafana.santspatrons.com', '_blank')
}

onMounted(async () => {
  const { data } = await api.get('/falla-years/current')
  currentFallaYear.value = data.code
})
</script>

<template>
  <q-page class="q-py-md">

    <div class="page-section">

      <div class="text-h5 text-primary q-mb-md">
        Exercici faller
      </div>

      <div class="document-row q-mb-xl row items-center justify-between">
        <div>
          Exercici actual:
          <span class="text-weight-medium">
            {{ currentFallaYear - 1 }} - {{ currentFallaYear }}
          </span>
        </div>

        <q-btn
          color="warning"
          icon="swap_horiz"
          label="Canviar exercici"
          @click="onChangeYear"
        >
          <q-tooltip>
            Crea el següent exercici faller
          </q-tooltip>
        </q-btn>
      </div>

      <q-dialog v-model="confirmChange">
        <q-card>
          <q-card-section class="text-h6">
            Canviar exercici faller?
          </q-card-section>

          <q-card-section>
            Aquesta acció crearà el nou exercici i tancarà l’actual.
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Cancel·lar" v-close-popup />
            <q-btn
              color="warning"
              label="Confirmar"
              @click="confirmChangeYear"
              v-close-popup
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

    </div>

    <div class="page-section">

      <div class="text-h5 text-primary q-mb-md">
        Documentació
      </div>

      <div class="column q-gutter-md">

        <div class="row items-center justify-between document-row">
          <span>Document d'adhesió a la falla</span>

          <q-btn round color="secondary" icon="picture_as_pdf" @click="downloadAdherencePdf">
            <q-tooltip>Generar PDF</q-tooltip>
          </q-btn>
        </div>

        <div class="row items-center justify-between document-row">
          <span>Document d'autorització a menors</span>

          <q-btn round color="secondary" icon="picture_as_pdf" @click="downloadAuthorizationPdf">
            <q-tooltip>Generar PDF</q-tooltip>
          </q-btn>
        </div>

        <div class="row items-center justify-between document-row">
          <span>Document d'adhesió de les parelles</span>

          <q-btn round color="secondary" icon="picture_as_pdf" @click="downloadPartnerPdf">
            <q-tooltip>Generar PDF</q-tooltip>
          </q-btn>
        </div>

      </div>

    </div>

    <div class="page-section">

      <div class="text-h5 text-primary q-mb-md">
        Accés ràpid
      </div>

      <div class="row wrap q-gutter-md">

        <q-card class="quick-card cursor-pointer" @click="goTo('member/basicData')">
          <q-card-section class="row items-center q-gutter-md">
            <q-icon name="groups" size="28px" color="primary" />
            <div>
              <div class="text-h6">Membres</div>
              <div class="text-caption text-grey-7">Gestió de membres i familiars</div>
            </div>
          </q-card-section>
        </q-card>

        <q-card class="quick-card cursor-pointer" @click="goTo('member/payment')">
          <q-card-section class="row items-center q-gutter-md">
            <q-icon name="money" size="28px" color="primary" />
            <div>
              <div class="text-h6">Pagaments</div>
              <div class="text-caption text-grey-7">Gestió de pagaments dels fallers</div>
            </div>
          </q-card-section>
        </q-card>

        <q-card class="quick-card cursor-pointer" @click="goTo('lottery/list')">
          <q-card-section class="row items-center q-gutter-md">
            <q-icon name="confirmation_number" size="28px" color="primary" />
            <div>
              <div class="text-h6">Loteria</div>
              <div class="text-caption text-grey-7">Control de números i participacions</div>
            </div>
          </q-card-section>
        </q-card>

        <q-card class="quick-card cursor-pointer" @click="goTo('directDebit/list')">
          <q-card-section class="row items-center q-gutter-md">
            <q-icon name="account_balance" size="28px" color="primary" />
            <div>
              <div class="text-h6">Domiciliacions</div>
              <div class="text-caption text-grey-7">Gestió de cobraments bancaris</div>
            </div>
          </q-card-section>
        </q-card>

        <q-card class="quick-card cursor-pointer" @click="goTo('category/list')">
          <q-card-section class="row items-center q-gutter-md">
            <q-icon name="category" size="28px" color="primary" />
            <div>
              <div class="text-h6">Categories</div>
              <div class="text-caption text-grey-7">Tipus de membres i configuració</div>
            </div>
          </q-card-section>
        </q-card>

        <q-card class="quick-card cursor-pointer" @click="goTo('buy/list')">
          <q-card-section class="row items-center q-gutter-md">
            <q-icon name="shopping_cart" size="28px" color="primary" />
            <div>
              <div class="text-h6">Compres</div>
              <div class="text-caption text-grey-7">Gestió de compres internes</div>
            </div>
          </q-card-section>
        </q-card>

        <q-card class="quick-card cursor-pointer" @click="goTo('sale/list')">
          <q-card-section class="row items-center q-gutter-md">
            <q-icon name="point_of_sale" size="28px" color="primary" />
            <div>
              <div class="text-h6">Vendes</div>
              <div class="text-caption text-grey-7">Facturació i vendes externes</div>
            </div>
          </q-card-section>
        </q-card>

        <q-card class="quick-card cursor-pointer" @click="goTo('supplier/list')">
          <q-card-section class="row items-center q-gutter-md">
            <q-icon name="local_shipping" size="28px" color="primary" />
            <div>
              <div class="text-h6">Proveïdors</div>
              <div class="text-caption text-grey-7">Gestió de proveïdors</div>
            </div>
          </q-card-section>
        </q-card>

        <q-card class="quick-card cursor-pointer" @click="goTo('client/list')">
          <q-card-section class="row items-center q-gutter-md">
            <q-icon name="contacts" size="28px" color="primary" />
            <div>
              <div class="text-h6">Clients</div>
              <div class="text-caption text-grey-7">Base de clients i relacions</div>
            </div>
          </q-card-section>
        </q-card>

        <q-card class="quick-card cursor-pointer" @click="openGrafana">
          <q-card-section class="row items-center q-gutter-md">
            <q-icon name="bar_chart" size="28px" color="primary" />
            <div>
              <div class="text-h6">Grafana</div>
              <div class="text-caption text-grey-7">Dashboards i estadístiques</div>
            </div>
          </q-card-section>
        </q-card>

      </div>

    </div>

  </q-page>
</template>

<style scoped>
.page-section {
  padding-left: 16px;
  padding-right: 16px;
  margin-bottom: 32px;
}

.document-row {
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 12px;
}

.q-card.cursor-pointer {
  transition: all 0.2s ease;
}

.q-card.cursor-pointer:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
}

.quick-card {
  width: calc(33.333% - 16px);
  min-width: 200px;
  border-left: 4px solid var(--q-primary) !important;
}

@media (max-width: 768px) {
  .quick-card {
    width: calc(50% - 16px);
  }
}

@media (max-width: 480px) {
  .quick-card {
    width: 100%;
  }
}
</style>